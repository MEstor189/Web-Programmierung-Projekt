package de.techcorp.ats.service;

import de.techcorp.ats.dto.ApplicationResponse;
import de.techcorp.ats.dto.CleanupJobResponse;
import de.techcorp.ats.entity.Application;
import de.techcorp.ats.entity.ApplicationDocument;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.ResourceNotFoundException;
import de.techcorp.ats.repository.ApplicationDocumentRepository;
import de.techcorp.ats.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplianceService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationService applicationService;

    public ComplianceService(ApplicationRepository applicationRepository,
                             ApplicationDocumentRepository documentRepository,
                             FileStorageService fileStorageService,
                             ApplicationService applicationService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.applicationService = applicationService;
    }

    @Transactional
    public ApplicationResponse anonymizeApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (application.isAnonymized()) {
            throw new BadRequestException("Diese Bewerbung wurde bereits anonymisiert.");
        }

        performAnonymization(application);
        Application saved = applicationRepository.save(application);
        return applicationService.mapToResponse(saved);
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ComplianceService.class);

    @Transactional
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 2 * * ?") // Täglich um 02:00 Uhr nachts
    public CleanupJobResponse runCleanupJob() {
        LocalDate today = LocalDate.now();
        List<Application> expiredApps = applicationRepository.findByRetentionUntilLessThanEqualAndAnonymizedFalse(today);

        log.info("DSGVO-Cleanup-Job gestartet: {} abgelaufene Bewerbungen gefunden.", expiredApps.size());

        int count = 0;
        for (Application app : expiredApps) {
            performAnonymization(app);
            applicationRepository.save(app);
            count++;
        }

        log.info("DSGVO-Cleanup-Job erfolgreich abgeschlossen: {} Bewerbungen anonymisiert & Dateien vernichtet.", count);
        return new CleanupJobResponse("success", count, LocalDateTime.now().toString());
    }

    private void performAnonymization(Application app) {
        Long anonId = app.getId();
        app.setFirstName("Anonymisiert");
        app.setLastName("Bewerber_Anonym_" + anonId);
        app.setEmail("anonymized_" + anonId + "@deleted.de");
        app.setPhone(null);
        app.setCoverLetterText(null);
        app.setGithubUrl(null);
        app.setLinkedinUrl(null);
        app.setAnonymized(true);
        app.setAnonymizedAt(LocalDateTime.now());

        // Physically delete uploaded document files
        List<ApplicationDocument> documents = documentRepository.findByApplicationId(app.getId());
        for (ApplicationDocument doc : documents) {
            if (doc.getStoredFilepath() != null) {
                fileStorageService.deleteFile(doc.getStoredFilepath());
            }
            doc.setDeleted(true);
            documentRepository.save(doc);
        }
    }
}
