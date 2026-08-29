package de.techcorp.ats.controller;

import de.techcorp.ats.dto.JobPostingCreateRequest;
import de.techcorp.ats.dto.JobPostingResponse;
import de.techcorp.ats.dto.JobPostingUpdateRequest;
import de.techcorp.ats.dto.PaginatedResponse;
import de.techcorp.ats.entity.EmploymentType;
import de.techcorp.ats.entity.JobPostingStatus;
import de.techcorp.ats.security.UserPrincipal;
import de.techcorp.ats.service.JobPostingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@Tag(name = "Job Postings", description = "Verwaltung und Abruf von Stellenanzeigen")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @GetMapping
    @Operation(summary = "Stellenanzeigen auflisten (Öffentlich & Recruiter)", description = "Listet Stellenanzeigen auf. Gäste sehen nur veröffentlichte Anzeigen.")
    public ResponseEntity<PaginatedResponse<JobPostingResponse>> listJobs(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "department_id", required = false) Long departmentId,
            @RequestParam(value = "employment_type", required = false) EmploymentType employmentType,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "status", required = false) JobPostingStatus status,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "page_size", defaultValue = "20") int pageSize,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PaginatedResponse<JobPostingResponse> response = jobPostingService.listJobs(
                search, departmentId, employmentType, location, status, page, pageSize, currentUser
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idOrSlug}")
    @Operation(summary = "Stellenanzeigen-Details abrufen", description = "Liefert die Details einer Stellenanzeige via numerischer ID oder URL-Slug.")
    public ResponseEntity<JobPostingResponse> getJobByIdOrSlug(
            @PathVariable("idOrSlug") String idOrSlug,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        JobPostingResponse job = jobPostingService.getJobByIdOrSlug(idOrSlug, currentUser);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    @Operation(summary = "Neue Stellenanzeige erstellen", description = "Legt eine neue Stellenanzeige an (nur Recruiter / Admin).")
    public ResponseEntity<JobPostingResponse> createJob(
            @Valid @RequestBody JobPostingCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        JobPostingResponse created = jobPostingService.createJob(request, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Stellenanzeige aktualisieren", description = "Aktualisiert Eigenschaften einer bestehenden Stellenanzeige.")
    public ResponseEntity<JobPostingResponse> updateJob(
            @PathVariable("id") Long id,
            @RequestBody JobPostingUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        JobPostingResponse updated = jobPostingService.updateJob(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Stellenanzeige löschen / archivieren", description = "Archiviert oder löscht eine Stellenanzeige.")
    public ResponseEntity<Void> deleteJob(@PathVariable("id") Long id) {
        jobPostingService.deleteOrArchiveJob(id);
        return ResponseEntity.noContent().build();
    }
}
