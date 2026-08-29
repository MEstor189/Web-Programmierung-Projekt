package de.techcorp.ats.controller;

import de.techcorp.ats.dto.PaginatedResponse;
import de.techcorp.ats.dto.UserCreateRequest;
import de.techcorp.ats.dto.UserResponse;
import de.techcorp.ats.dto.UserUpdateRequest;
import de.techcorp.ats.entity.Role;
import de.techcorp.ats.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "Verwaltung interner Benutzerkonten (Nur Admin)")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Interne Benutzerkonten auflisten (Nur Admin)", description = "Verwaltungsansicht für IT-Admins zur Einsicht aller Benutzerkonten.")
    public ResponseEntity<PaginatedResponse<UserResponse>> listUsers(
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "page_size", defaultValue = "20") int pageSize) {

        PaginatedResponse<UserResponse> response = userService.listUsers(role, page, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Neuen Mitarbeiter-Nutzer anlegen (Nur Admin)", description = "Erstellt ein neues internes Benutzerkonto.")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse created = userService.createUser(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Benutzerkonto aktualisieren (Nur Admin)", description = "Aktualisiert Rollen, Aktivierungsstatus oder Zugangsdaten eines Benutzers.")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable("id") Long id,
            @RequestBody UserUpdateRequest request) {

        UserResponse updated = userService.updateUser(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Benutzerkonto löschen (Nur Admin)", description = "Löscht ein Benutzerkonto endgültig.")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
