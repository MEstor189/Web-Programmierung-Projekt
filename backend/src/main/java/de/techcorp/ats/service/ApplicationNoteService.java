package de.techcorp.ats.service;

import de.techcorp.ats.dto.ApplicationNoteCreateRequest;
import de.techcorp.ats.dto.ApplicationNoteResponse;
import de.techcorp.ats.entity.Application;
import de.techcorp.ats.entity.ApplicationNote;
import de.techcorp.ats.entity.Role;
import de.techcorp.ats.entity.User;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.ForbiddenException;
import de.techcorp.ats.exception.ResourceNotFoundException;
import de.techcorp.ats.repository.ApplicationNoteRepository;
import de.techcorp.ats.repository.ApplicationRepository;
import de.techcorp.ats.repository.UserRepository;
import de.techcorp.ats.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationNoteService {

    private final ApplicationNoteRepository noteRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationNoteService(ApplicationNoteRepository noteRepository,
                                  ApplicationRepository applicationRepository,
                                  UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ApplicationNoteResponse> listNotes(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Bewerbung nicht gefunden.");
        }

        return noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationNoteResponse createNote(Long applicationId, ApplicationNoteCreateRequest request, UserPrincipal currentUser) {
        if (request.getAggDisclaimerConfirmed() == null || !request.getAggDisclaimerConfirmed()) {
            throw new BadRequestException("Die Bestätigung der AGG-Richtlinie ist für das Verfassen interner Notizen verpflichtend.");
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Bewerbung nicht gefunden."));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden."));

        ApplicationNote note = new ApplicationNote();
        note.setApplication(application);
        note.setAuthor(user);
        note.setRating(request.getRating());
        note.setContent(request.getContent().trim());
        note.setAggDisclaimerConfirmed(true);

        ApplicationNote saved = noteRepository.save(note);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteNote(Long applicationId, Long noteId, UserPrincipal currentUser) {
        ApplicationNote note = noteRepository.findByIdAndApplicationId(noteId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notiz nicht gefunden."));

        if (currentUser.getRole() != Role.ADMIN && !note.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Nur der Verfasser oder ein Admin darf diese Notiz löschen.");
        }

        noteRepository.delete(note);
    }

    public ApplicationNoteResponse mapToResponse(ApplicationNote note) {
        if (note == null) return null;
        ApplicationNoteResponse response = new ApplicationNoteResponse();
        response.setId(note.getId());
        response.setApplicationId(note.getApplication().getId());
        response.setUserId(note.getAuthor().getId());
        response.setAuthorName(note.getAuthor().getFirstName() + " " + note.getAuthor().getLastName());
        response.setRating(note.getRating());
        response.setContent(note.getContent());
        response.setAggDisclaimerConfirmed(note.isAggDisclaimerConfirmed());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());
        return response;
    }
}
