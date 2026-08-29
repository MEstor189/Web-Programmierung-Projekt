package de.techcorp.ats.controller;

import de.techcorp.ats.dto.CandidateRegisterRequest;
import de.techcorp.ats.dto.LoginRequest;
import de.techcorp.ats.dto.TokenResponse;
import de.techcorp.ats.dto.UserResponse;
import de.techcorp.ats.security.UserPrincipal;
import de.techcorp.ats.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentifizierungs- und Registrierungsendpunkte")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Operation(summary = "Benutzer-Login & JWT-Token-Ausgabe (Form Data)", description = "Authentifiziert einen Nutzer via Form-Data (username & password).")
    public ResponseEntity<TokenResponse> loginForm(@RequestParam("username") String username,
                                                   @RequestParam("password") String password) {
        TokenResponse token = authService.login(username, password);
        return ResponseEntity.ok(token);
    }

    @PostMapping(value = "/login/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Benutzer-Login via JSON Payload", description = "JSON-basierter Login-Endpunkt für Frontend-Clients.")
    public ResponseEntity<TokenResponse> loginJson(@Valid @RequestBody LoginRequest request) {
        TokenResponse token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register-candidate")
    @Operation(summary = "Bewerber-Registrierung & Auto-Verknüpfung (ADR 0003)", description = "Registriert ein neues Bewerberkonto (CANDIDATE) und verknüpft automatisch bisherige Gastbewerbungen.")
    public ResponseEntity<UserResponse> registerCandidate(@Valid @RequestBody CandidateRegisterRequest request) {
        UserResponse response = authService.registerCandidate(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Profil des aktuell eingeloggten Nutzers", description = "Liefert das Profil des aktuell authentifizierten Nutzers.")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = authService.getCurrentUserProfile(currentUser);
        return ResponseEntity.ok(response);
    }
}
