package de.techcorp.ats.controller;

import de.techcorp.ats.dto.ApplicationResponse;
import de.techcorp.ats.dto.CleanupJobResponse;
import de.techcorp.ats.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/compliance")
@Tag(name = "Compliance & DSGVO", description = "DSGVO-Anonymisierung und Aufbewahrungsfristen-Bereinigung")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @PostMapping("/applications/{id}/anonymize")
    @Operation(summary = "Manuelle DSGVO-Anonymisierung auslösen", description = "Anonymisiert die personenbezogenen Daten einer Bewerbung und löscht Dokumente.")
    public ResponseEntity<ApplicationResponse> anonymizeApplication(@PathVariable("id") Long id) {
        ApplicationResponse response = complianceService.anonymizeApplication(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/run-cleanup-job")
    @Operation(summary = "Täglicher Batch-Job zur DSGVO-Löschung abgelaufener Bewerbungen", description = "Überprüft alle Bewerbungen auf Ablauf der Frist und führt die Anonymisierung durch.")
    public ResponseEntity<CleanupJobResponse> runRetentionCleanupJob() {
        CleanupJobResponse response = complianceService.runCleanupJob();
        return ResponseEntity.ok(response);
    }
}
