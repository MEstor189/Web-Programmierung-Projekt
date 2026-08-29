package de.techcorp.ats.controller;

import de.techcorp.ats.dto.DepartmentCreateRequest;
import de.techcorp.ats.dto.DepartmentResponse;
import de.techcorp.ats.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@Tag(name = "Departments", description = "Verwaltung von Fachbereichen und Abteilungen")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @Operation(summary = "Alle Fachbereiche auflisten (Öffentlich)", description = "Liefert alle aktiven Fachbereiche für Dropdown-Auswahlen im Frontend.")
    public ResponseEntity<List<DepartmentResponse>> listDepartments() {
        List<DepartmentResponse> list = departmentService.getAllDepartments();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @Operation(summary = "Neuen Fachbereich anlegen", description = "Legt einen neuen Fachbereich an (nur Admin).")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        DepartmentResponse created = departmentService.createDepartment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
