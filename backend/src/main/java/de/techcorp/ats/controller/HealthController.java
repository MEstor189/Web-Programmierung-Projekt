package de.techcorp.ats.controller;

import de.techcorp.ats.dto.HealthCheckResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health Check", description = "System- und Datenbankstatusprüfungen")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    @Operation(summary = "API & DB Status Check", description = "Prüft den Betriebsstatus des Spring Boot Backends und die Datenbankverbindung.")
    public ResponseEntity<HealthCheckResponse> checkHealth() {
        String dbStatus = "disconnected";
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbStatus = "connected";
        } catch (Exception e) {
            dbStatus = "error: " + e.getMessage();
        }

        HealthCheckResponse response = new HealthCheckResponse("ok", dbStatus, "1.0.0");
        return ResponseEntity.ok(response);
    }
}
