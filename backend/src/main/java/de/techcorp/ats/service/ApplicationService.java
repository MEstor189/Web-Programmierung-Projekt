package de.techcorp.ats.service;

import de.techcorp.ats.dto.*;
import de.techcorp.ats.entity.*;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.ForbiddenException;
import de.techcorp.ats.exception.ResourceNotFoundException;
import de.techcorp.ats.repository.*;
import de.techcorp.ats.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final FileStorageService fileStorageService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobPostingRepository jobPostingRepository,
                              UserRepository userRepository,
                              ApplicationDocumentRepository documentRepository,
                              ApplicationStatusHistoryRepository statusHistoryRepository,
                              FileStorageService fileStorageService) {
        this.applicationRepository = applicationRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ApplicationResponse submitApplication(
            Long jobPostingId,
            String firstName,
            String lastName,
            String email,
            String phone,
            BigDecimal expectedSalary,
            LocalDate earliestStartingDate,
            String noticePeriod,
            String githubUrl,
            String linkedinUrl,
            String coverLetterText,
            Boolean dsgvoConsent,
            MultipartFile cvFile,
            String cvFileType,
            List<MultipartFile> additionalFiles,
            List<String> additionalFileTypes,
            UserPrincipal currentUser) {

        if (dsgvoConsent == null || !dsgvoConsent) {
            throw new BadRequestException("Die Zustimmung zur Datenschutzerklärung (DSGVO) ist zwingend erforderlich.");
        }

        JobPosting job = jobPostingRepository.findByIdAndStatus(jobPostingId, JobPostingStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Das gewählte Stellenangebot existiert nicht oder ist nicht mehr aktiv."));

        boolean hasCv = cvFile != null && !cvFile.isEmpty();
        boolean hasAdditional = additionalFiles != null && !additionalFiles.isEmpty() && additionalFiles.stream().anyMatch(f -> !f.isEmpty());

        if (!hasCv && !hasAdditional) {
            throw new BadRequestException("Das Hochladen von mindestens einem Bewerbungsdokument ist verpflichtend.");
        }

        User applicantUser = null;
        if (currentUser != null && currentUser.getRole() == Role.CANDIDATE) {
            applicantUser = userRepository.findById(currentUser.getId()).orElse(null);
        }

        Application application = new Application();
        application.setJobPosting(job);
        application.setApplicantUser(applicantUser);
        application.setFirstName(firstName.trim());
        application.setLastName(lastName.trim());
        application.setEmail(email.toLowerCase().trim());
        application.setPhone(phone != null && !phone.trim().isEmpty() ? phone.trim() : null);
        application.setExpectedSalary(expectedSalary);
        application.setEarliestStartingDate(earliestStartingDate);
        application.setNoticePeriod(noticePeriod != null && !noticePeriod.trim().isEmpty() ? noticePeriod.trim() : null);
        application.setGithubUrl(githubUrl != null && !githubUrl.trim().isEmpty() ? githubUrl.trim() : null);
        application.setLinkedinUrl(linkedinUrl != null && !linkedinUrl.trim().isEmpty() ? linkedinUrl.trim() : null);
        application.setCoverLetterText(coverLetterText != null && !coverLetterText.trim().isEmpty() ? coverLetterText.trim() : null);
        application.setStatus(ApplicationStatus.RECEIVED);
        application.setDsgvoConsent(true);
        application.setDsgvoConsentAt(LocalDateTime.now());
        application.setAnonymized(false);
        application.setRetentionUntil(LocalDate.now().plusDays(180));

        Application savedApp = applicationRepository.save(application);

        // Store primary CV/first file if uploaded
        if (hasCv) {
            String storedFilePath = fileStorageService.storeFile(cvFile);
            ApplicationDocument document = new ApplicationDocument();
            document.setApplication(savedApp);
            String fType = (cvFileType != null && !cvFileType.trim().isEmpty()) ? cvFileType.trim().toUpperCase() : deriveFileType(cvFile.getOriginalFilename());
            document.setFileType(fType);
            document.setOriginalFilename(cvFile.getOriginalFilename() != null ? cvFile.getOriginalFilename() : "Dokument");
            document.setStoredFilepath(storedFilePath);
            document.setFileSizeBytes(cvFile.getSize());
            document.setMimeType(detectMimeType(cvFile.getOriginalFilename(), cvFile.getContentType()));
            document.setDeleted(false);
            documentRepository.save(document);
        }

        // Store additional documents if uploaded
        if (additionalFiles != null) {
            for (int i = 0; i < additionalFiles.size(); i++) {
                MultipartFile file = additionalFiles.get(i);
                if (file != null && !file.isEmpty()) {
                    String explicitType = (additionalFileTypes != null && i < additionalFileTypes.size()) ? additionalFileTypes.get(i) : null;
                    String fType = (explicitType != null && !explicitType.trim().isEmpty()) ? explicitType.trim().toUpperCase() : deriveFileType(file.getOriginalFilename());

                    String storedFilePath = fileStorageService.storeFile(file);
                    ApplicationDocument document = new ApplicationDocument();
                    document.setApplication(savedApp);
                    document.setFileType(fType);
                    document.setOriginalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "Dokument");
                    document.setStoredFilepath(storedFilePath);
                    document.setFileSizeBytes(file.getSize());
                    document.setMimeType(detectMimeType(file.getOriginalFilename(), file.getContentType()));
                    document.setDeleted(false);
                    documentRepository.save(document);
                }
            }
        }

        // Initial History
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                savedApp,
                applicantUser,
                null,
                ApplicationStatus.RECEIVED.name(),
                "Bewerbung eingegangen."
        );
        statusHistoryRepository.save(history);

        return mapToResponse(savedApp);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(UserPrincipal currentUser) {
        return applicationRepository.findByApplicantUserIdOrEmailIgnoreCaseOrderByCreatedAtDesc(currentUser.getId(), currentUser.getEmail())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ApplicationResponse> listApplications(
            Long jobPostingId,
            String status,
            String search,
            int page,
            int pageSize) {

        int zeroIndexedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroIndexedPage, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Application> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (jobPostingId != null) {
                predicates.add(cb.equal(root.get("jobPosting").get("id"), jobPostingId));
            }

            if (status != null && !status.trim().isEmpty()) {
                try {
                    ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase().trim());
                    predicates.add(cb.equal(root.get("status"), appStatus));
                } catch (IllegalArgumentException ignored) {}
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                Predicate fnMatch = cb.like(cb.lower(root.get("firstName")), pattern);
                Predicate lnMatch = cb.like(cb.lower(root.get("lastName")), pattern);
                Predicate emMatch = cb.like(cb.lower(root.get("email")), pattern);
                predicates.add(cb.or(fnMatch, lnMatch, emMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Application> appPage = applicationRepository.findAll(spec, pageable);

        List<ApplicationResponse> items = appPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                items,
                appPage.getTotalElements(),
                page,
                pageSize,
                Math.max(1, appPage.getTotalPages())
        );
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(Long id, UserPrincipal currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (currentUser.getRole() == Role.CANDIDATE) {
            boolean isOwner = (application.getApplicantUser() != null && application.getApplicantUser().getId().equals(currentUser.getId()))
                    || application.getEmail().equalsIgnoreCase(currentUser.getEmail());
            if (!isOwner) {
                throw new ForbiddenException("Zugriff verweigert.");
            }
        }

        return mapToDetailResponse(application);
    }

    @Transactional
    public ApplicationDetailResponse updateStatus(Long id, ApplicationStatusUpdateRequest request, UserPrincipal currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(request.getStatus().toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Ungültiger Status: " + request.getStatus());
        }

        String oldStatusStr = application.getStatus().name();
        application.setStatus(newStatus);

        if (newStatus == ApplicationStatus.REJECTED) {
            application.setRetentionUntil(LocalDate.now().plusDays(180));
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                application,
                user,
                oldStatusStr,
                newStatus.name(),
                request.getReason()
        );
        statusHistoryRepository.save(history);

        Application saved = applicationRepository.save(application);
        return mapToDetailResponse(saved);
    }

    @Transactional(readOnly = true)
    public Resource streamDocument(Long applicationId, Long docId) {
        ApplicationDocument document = documentRepository.findByIdAndApplicationId(docId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Dokument nicht gefunden oder wurde DSGVO-konform gelöscht."));

        if (document.isDeleted()) {
            throw new ResourceNotFoundException("Dokument wurde DSGVO-konform gelöscht.");
        }

        return fileStorageService.loadFileAsResource(document.getStoredFilepath());
    }

    @Transactional(readOnly = true)
    public ApplicationDocument getDocumentEntity(Long applicationId, Long docId) {
        return documentRepository.findByIdAndApplicationId(docId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Dokument nicht gefunden."));
    }

    @Transactional
    public ApplicationResponse updateApplication(Long id, ApplicationUpdateRequest request, UserPrincipal currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (currentUser.getRole() == Role.CANDIDATE) {
            boolean isOwner = (application.getApplicantUser() != null && application.getApplicantUser().getId().equals(currentUser.getId()))
                    || application.getEmail().equalsIgnoreCase(currentUser.getEmail());
            if (!isOwner) {
                throw new ForbiddenException("Zugriff verweigert.");
            }
            if (application.getStatus() == ApplicationStatus.REJECTED || application.getStatus() == ApplicationStatus.WITHDRAWN) {
                throw new BadRequestException("Beendete oder zurückgezogene Bewerbungen können nicht mehr bearbeitet werden.");
            }
        }

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            application.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            application.setLastName(request.getLastName().trim());
        }
        if (request.getPhone() != null) {
            application.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        }
        if (request.getExpectedSalary() != null) {
            application.setExpectedSalary(request.getExpectedSalary());
        }
        if (request.getEarliestStartingDate() != null) {
            application.setEarliestStartingDate(request.getEarliestStartingDate());
        }
        if (request.getNoticePeriod() != null) {
            application.setNoticePeriod(request.getNoticePeriod().trim().isEmpty() ? null : request.getNoticePeriod().trim());
        }
        if (request.getGithubUrl() != null) {
            application.setGithubUrl(request.getGithubUrl().trim().isEmpty() ? null : request.getGithubUrl().trim());
        }
        if (request.getLinkedinUrl() != null) {
            application.setLinkedinUrl(request.getLinkedinUrl().trim().isEmpty() ? null : request.getLinkedinUrl().trim());
        }
        if (request.getCoverLetterText() != null) {
            application.setCoverLetterText(request.getCoverLetterText().trim().isEmpty() ? null : request.getCoverLetterText().trim());
        }

        Application saved = applicationRepository.save(application);
        return mapToResponse(saved);
    }

    @Transactional
    public ApplicationResponse withdrawApplication(Long id, UserPrincipal currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (currentUser.getRole() == Role.CANDIDATE) {
            boolean isOwner = (application.getApplicantUser() != null && application.getApplicantUser().getId().equals(currentUser.getId()))
                    || application.getEmail().equalsIgnoreCase(currentUser.getEmail());
            if (!isOwner) {
                throw new ForbiddenException("Zugriff verweigert.");
            }
            if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
                throw new BadRequestException("Die Bewerbung wurde bereits zurückgezogen.");
            }
            if (application.getStatus() == ApplicationStatus.REJECTED || application.getStatus() == ApplicationStatus.HIRED) {
                throw new BadRequestException("Abgeschlossene Verfahren können nicht mehr zurückgezogen werden.");
            }
        }

        String oldStatusStr = application.getStatus().name();
        application.setStatus(ApplicationStatus.WITHDRAWN);

        User user = userRepository.findById(currentUser.getId()).orElse(null);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                application,
                user,
                oldStatusStr,
                ApplicationStatus.WITHDRAWN.name(),
                "Vom Bewerber zurückgezogen."
        );
        statusHistoryRepository.save(history);

        Application saved = applicationRepository.save(application);
        return mapToResponse(saved);
    }

    public ApplicationResponse mapToResponse(Application app) {
        if (app == null) return null;
        ApplicationResponse response = new ApplicationResponse();
        response.setId(app.getId());
        response.setJobPostingId(app.getJobPosting().getId());
        response.setJobPostingTitle(app.getJobPosting().getTitle());
        if (app.getApplicantUser() != null) {
            response.setApplicantUserId(app.getApplicantUser().getId());
        }
        response.setFirstName(app.getFirstName());
        response.setLastName(app.getLastName());
        response.setEmail(app.getEmail());
        response.setPhone(app.getPhone());
        response.setExpectedSalary(app.getExpectedSalary());
        response.setEarliestStartingDate(app.getEarliestStartingDate());
        response.setNoticePeriod(app.getNoticePeriod());
        response.setGithubUrl(app.getGithubUrl());
        response.setLinkedinUrl(app.getLinkedinUrl());
        response.setCoverLetterText(app.getCoverLetterText());
        response.setStatus(app.getStatus());
        response.setDsgvoConsent(app.isDsgvoConsent());
        response.setIsAnonymized(app.isAnonymized());
        response.setRetentionUntil(app.getRetentionUntil());
        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());
        return response;
    }

    @Transactional
    public ApplicationDocumentResponse addDocument(
            Long applicationId,
            MultipartFile file,
            String fileType,
            UserPrincipal currentUser) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (currentUser.getRole() == Role.CANDIDATE) {
            boolean isOwner = (application.getApplicantUser() != null && application.getApplicantUser().getId().equals(currentUser.getId()))
                    || application.getEmail().equalsIgnoreCase(currentUser.getEmail());
            if (!isOwner) {
                throw new ForbiddenException("Zugriff verweigert.");
            }
            if (application.getStatus() == ApplicationStatus.REJECTED || application.getStatus() == ApplicationStatus.WITHDRAWN) {
                throw new BadRequestException("Zu beendeten oder zurückgezogenen Bewerbungen können keine Dokumente mehr hinzugefügt werden.");
            }
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Keine Datei ausgewählt.");
        }

        String storedPath = fileStorageService.storeFile(file);

        ApplicationDocument document = new ApplicationDocument();
        document.setApplication(application);
        document.setFileType(fileType != null && !fileType.trim().isEmpty() ? fileType.trim().toUpperCase() : deriveFileType(file.getOriginalFilename()));
        document.setOriginalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "Dokument");
        document.setStoredFilepath(storedPath);
        document.setFileSizeBytes(file.getSize());
        document.setMimeType(detectMimeType(file.getOriginalFilename(), file.getContentType()));
        document.setDeleted(false);

        ApplicationDocument saved = documentRepository.save(document);

        User changedBy = (currentUser != null) ? userRepository.findById(currentUser.getId()).orElse(null) : null;

        // Status history record
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                application,
                changedBy,
                application.getStatus().name(),
                application.getStatus().name(),
                "Dokument hochgeladen: " + saved.getOriginalFilename()
        );
        statusHistoryRepository.save(history);

        return mapToDocumentResponse(saved);
    }

    @Transactional
    public void deleteDocument(Long applicationId, Long docId, UserPrincipal currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        if (currentUser.getRole() == Role.CANDIDATE) {
            boolean isOwner = (application.getApplicantUser() != null && application.getApplicantUser().getId().equals(currentUser.getId()))
                    || application.getEmail().equalsIgnoreCase(currentUser.getEmail());
            if (!isOwner) {
                throw new ForbiddenException("Zugriff verweigert.");
            }
            if (application.getStatus() == ApplicationStatus.REJECTED || application.getStatus() == ApplicationStatus.WITHDRAWN) {
                throw new BadRequestException("Dokumente beendeter oder zurückgezogener Bewerbungen können nicht mehr gelöscht werden.");
            }
        }

        ApplicationDocument document = documentRepository.findByIdAndApplicationId(docId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Dokument nicht gefunden."));

        fileStorageService.deleteFile(document.getStoredFilepath());
        document.setDeleted(true);
        documentRepository.save(document);

        User changedBy = (currentUser != null) ? userRepository.findById(currentUser.getId()).orElse(null) : null;

        // History entry
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                application,
                changedBy,
                application.getStatus().name(),
                application.getStatus().name(),
                "Dokument entfernt: " + document.getOriginalFilename()
        );
        statusHistoryRepository.save(history);
    }

    public ApplicationDocumentResponse mapToDocumentResponse(ApplicationDocument doc) {
        ApplicationDocumentResponse docResp = new ApplicationDocumentResponse();
        docResp.setId(doc.getId());
        docResp.setApplicationId(doc.getApplication().getId());
        docResp.setFileType(doc.getFileType());
        docResp.setOriginalFilename(doc.getOriginalFilename());
        docResp.setFileSizeBytes(doc.getFileSizeBytes());
        docResp.setMimeType(doc.getMimeType());
        docResp.setIsDeleted(doc.isDeleted());
        docResp.setUploadedAt(doc.getUploadedAt());
        return docResp;
    }

    private String deriveFileType(String filename) {
        if (filename == null) return "OTHER";
        String lower = filename.toLowerCase();
        if (lower.contains("lebenslauf") || lower.contains("cv") || lower.contains("resume")) return "CV";
        if (lower.contains("anschreiben") || lower.contains("cover") || lower.contains("motivation")) return "COVER_LETTER";
        if (lower.contains("zeugnis") || lower.contains("zertifikat") || lower.contains("certificate")) return "CERTIFICATE";
        if (lower.contains("portfolio") || lower.contains("arbeitsprobe")) return "PORTFOLIO";
        if (lower.contains("foto") || lower.contains("bild") || lower.contains("photo") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "PHOTO";
        return "ATTACHMENT";
    }

    private String detectMimeType(String filename, String fallback) {
        if (filename == null) return fallback != null ? fallback : "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".doc")) return "application/msword";
        if (lower.endsWith(".odt")) return "application/vnd.oasis.opendocument.text";
        if (lower.endsWith(".rtf")) return "application/rtf";
        if (lower.endsWith(".txt")) return "text/plain";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return fallback != null ? fallback : "application/octet-stream";
    }

    public ApplicationDetailResponse mapToDetailResponse(Application app) {
        if (app == null) return null;
        ApplicationDetailResponse response = new ApplicationDetailResponse();
        response.setId(app.getId());
        response.setJobPostingId(app.getJobPosting().getId());
        response.setJobPostingTitle(app.getJobPosting().getTitle());
        if (app.getApplicantUser() != null) {
            response.setApplicantUserId(app.getApplicantUser().getId());
        }
        response.setFirstName(app.getFirstName());
        response.setLastName(app.getLastName());
        response.setEmail(app.getEmail());
        response.setPhone(app.getPhone());
        response.setExpectedSalary(app.getExpectedSalary());
        response.setEarliestStartingDate(app.getEarliestStartingDate());
        response.setNoticePeriod(app.getNoticePeriod());
        response.setGithubUrl(app.getGithubUrl());
        response.setLinkedinUrl(app.getLinkedinUrl());
        response.setCoverLetterText(app.getCoverLetterText());
        response.setStatus(app.getStatus());
        response.setDsgvoConsent(app.isDsgvoConsent());
        response.setIsAnonymized(app.isAnonymized());
        response.setRetentionUntil(app.getRetentionUntil());
        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());

        if (app.getDocuments() != null) {
            response.setDocuments(app.getDocuments().stream()
                    .filter(doc -> !doc.isDeleted())
                    .map(this::mapToDocumentResponse)
                    .collect(Collectors.toList()));
        }

        if (app.getNotes() != null) {
            response.setNotes(app.getNotes().stream().map(note -> {
                ApplicationNoteResponse noteResp = new ApplicationNoteResponse();
                noteResp.setId(note.getId());
                noteResp.setApplicationId(app.getId());
                noteResp.setUserId(note.getAuthor().getId());
                noteResp.setAuthorName(note.getAuthor().getFirstName() + " " + note.getAuthor().getLastName());
                noteResp.setRating(note.getRating());
                noteResp.setContent(note.getContent());
                noteResp.setAggDisclaimerConfirmed(note.isAggDisclaimerConfirmed());
                noteResp.setCreatedAt(note.getCreatedAt());
                noteResp.setUpdatedAt(note.getUpdatedAt());
                return noteResp;
            }).collect(Collectors.toList()));
        }

        if (app.getStatusHistory() != null) {
            response.setStatusHistory(app.getStatusHistory().stream().map(history -> {
                ApplicationStatusHistoryResponse hResp = new ApplicationStatusHistoryResponse();
                hResp.setId(history.getId());
                hResp.setApplicationId(app.getId());
                if (history.getChangedByUser() != null) {
                    hResp.setChangedByUserId(history.getChangedByUser().getId());
                    hResp.setChangedByUserName(history.getChangedByUser().getFirstName() + " " + history.getChangedByUser().getLastName());
                }
                hResp.setOldStatus(history.getOldStatus());
                hResp.setNewStatus(history.getNewStatus());
                hResp.setReason(history.getReason());
                hResp.setCreatedAt(history.getCreatedAt());
                return hResp;
            }).collect(Collectors.toList()));
        }

        return response;
    }
}
