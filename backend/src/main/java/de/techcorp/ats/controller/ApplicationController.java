package de.techcorp.ats.controller;

import de.techcorp.ats.dto.*;
import de.techcorp.ats.entity.ApplicationDocument;
import de.techcorp.ats.security.UserPrincipal;
import de.techcorp.ats.service.ApplicationNoteService;
import de.techcorp.ats.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Applications", description = "Bewerbungsprozess, Kandidatenpipeline & Notizen")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationNoteService noteService;

    public ApplicationController(ApplicationService applicationService,
                                 ApplicationNoteService noteService) {
        this.applicationService = applicationService;
        this.noteService = noteService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bewerbung einreichen (Schnellbewerbung oder Authentifiziert - ADR 0003)", description = "Reicht eine neue Bewerbung inkl. Dokumenten-Uploads ein.")
    public ResponseEntity<ApplicationResponse> submitApplication(
            @RequestParam("job_posting_id") Long jobPostingId,
            @RequestParam("first_name") String firstName,
            @RequestParam("last_name") String lastName,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "expected_salary", required = false) BigDecimal expectedSalary,
            @RequestParam(value = "earliest_starting_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate earliestStartingDate,
            @RequestParam(value = "notice_period", required = false) String noticePeriod,
            @RequestParam(value = "github_url", required = false) String githubUrl,
            @RequestParam(value = "linkedin_url", required = false) String linkedinUrl,
            @RequestParam(value = "cover_letter_text", required = false) String coverLetterText,
            @RequestParam("dsgvo_consent") Boolean dsgvoConsent,
            @RequestParam(value = "cv_file", required = false) MultipartFile cvFile,
            @RequestParam(value = "cv_file_type", required = false) String cvFileType,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file_types", required = false) List<String> fileTypes,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationResponse response = applicationService.submitApplication(
                jobPostingId, firstName, lastName, email, phone, expectedSalary,
                earliestStartingDate, noticePeriod, githubUrl, linkedinUrl,
                coverLetterText, dsgvoConsent, cvFile, cvFileType, files, fileTypes, currentUser
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Eigene Bewerbungen des registrierten Bewerbers abrufen (ADR 0003)", description = "Liefert alle Bewerbungen des eingeloggten Bewerbers.")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ApplicationResponse> list = applicationService.getMyApplications(currentUser);
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @Operation(summary = "Recruiter-Liste aller Bewerbungen mit Filtern", description = "Listet Bewerbungen für Recruiter/Admins mit Such- und Filterfunktionen auf.")
    public ResponseEntity<PaginatedResponse<ApplicationResponse>> listApplications(
            @RequestParam(value = "job_posting_id", required = false) Long jobPostingId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "page_size", defaultValue = "20") int pageSize) {

        PaginatedResponse<ApplicationResponse> response = applicationService.listApplications(
                jobPostingId, status, search, page, pageSize
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detailansicht einer Bewerbung", description = "Liefert die Vollansicht einer Bewerbung inkl. Dokumenten, Notizen & Verlauf.")
    public ResponseEntity<ApplicationDetailResponse> getApplicationDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationDetailResponse response = applicationService.getApplicationDetail(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Bewerbung bearbeiten", description = "Aktualisiert Angaben einer bestehenden Bewerbung (z.B. Kontaktdaten, Gehalt, Anschreiben).")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable("id") Long id,
            @RequestBody ApplicationUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationResponse response = applicationService.updateApplication(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Pipeline-Status einer Bewerbung ändern", description = "Ändert den Pipeline-Status einer Bewerbung und trägt den Wechsel in die Historie ein.")
    public ResponseEntity<ApplicationDetailResponse> updateApplicationStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationDetailResponse response = applicationService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Weiteres Dokument zu einer Bewerbung hinzufügen", description = "Lädt ein zusätzliches Dokument (z.B. Zeugnis, Zertifikat, Foto, Anschreiben) hoch.")
    public ResponseEntity<ApplicationDocumentResponse> addDocument(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "file_type", defaultValue = "OTHER") String fileType,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationDocumentResponse response = applicationService.addDocument(id, file, fileType, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/documents/{docId}")
    @Operation(summary = "Dokument aus Bewerbung löschen", description = "Löscht ein hochgeladenes Dokument aus der Bewerbung.")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable("id") Long id,
            @PathVariable("docId") Long docId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        applicationService.deleteDocument(id, docId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/documents/{docId}")
    @Operation(summary = "Dokument streamen / anzeigen", description = "Streamt oder zeigt ein Dokument im Browser an.")
    public ResponseEntity<Resource> streamApplicationDocument(
            @PathVariable("id") Long id,
            @PathVariable("docId") Long docId) {

        Resource resource = applicationService.streamDocument(id, docId);
        ApplicationDocument doc = applicationService.getDocumentEntity(id, docId);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            if (doc.getMimeType() != null && !doc.getMimeType().trim().isEmpty()) {
                mediaType = MediaType.parseMediaType(doc.getMimeType());
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Bewerbung zurückziehen", description = "Erlaubt das Zurückziehen einer Bewerbung.")
    public ResponseEntity<ApplicationResponse> withdrawApplication(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationResponse response = applicationService.withdrawApplication(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/notes")
    @Operation(summary = "Notizen & Bewertungen einer Bewerbung abrufen", description = "Liefert alle internen Notizen und Bewertungen zu einer Bewerbung.")
    public ResponseEntity<List<ApplicationNoteResponse>> listNotes(@PathVariable("id") Long id) {
        List<ApplicationNoteResponse> list = noteService.listNotes(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "AGG-konforme Notiz verfassen", description = "Erfasst eine neue interne Notiz mit AGG-Bestätigung.")
    public ResponseEntity<ApplicationNoteResponse> createNote(
            @PathVariable("id") Long id,
            @Valid @RequestBody ApplicationNoteCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ApplicationNoteResponse note = noteService.createNote(id, request, currentUser);
        return new ResponseEntity<>(note, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    @Operation(summary = "Notiz löschen", description = "Löscht eine Notiz (nur Verfasser oder Admin).")
    public ResponseEntity<Void> deleteNote(
            @PathVariable("id") Long id,
            @PathVariable("noteId") Long noteId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        noteService.deleteNote(id, noteId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
