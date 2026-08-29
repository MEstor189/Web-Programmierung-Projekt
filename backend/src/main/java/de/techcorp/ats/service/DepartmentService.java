package de.techcorp.ats.service;

import de.techcorp.ats.dto.DepartmentCreateRequest;
import de.techcorp.ats.dto.DepartmentResponse;
import de.techcorp.ats.entity.Department;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isEmpty()) {
            throw new BadRequestException("Der Abteilungsname darf nicht leer sein.");
        }

        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Ein Fachbereich mit dem Namen '" + name + "' existiert bereits.");
        }

        String code = request.getCode() != null && !request.getCode().trim().isEmpty()
                ? request.getCode().trim().toUpperCase(Locale.ROOT)
                : generateUniqueCode(name);

        Department department = new Department(
                name,
                code,
                request.getDescription() != null && !request.getDescription().trim().isEmpty() ? request.getDescription().trim() : null
        );

        Department saved = departmentRepository.save(department);
        return mapToResponse(saved);
    }

    private String generateUniqueCode(String name) {
        String cleaned = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase(Locale.ROOT);
        String base = cleaned.length() > 8 ? cleaned.substring(0, 8) : cleaned;
        if (base.isEmpty()) {
            base = "DEPT";
        }

        String candidate = base;
        int counter = 1;
        while (departmentRepository.existsByCodeIgnoreCase(candidate)) {
            String suffix = String.valueOf(counter);
            int maxBaseLen = Math.max(1, 20 - suffix.length());
            String truncatedBase = base.length() > maxBaseLen ? base.substring(0, maxBaseLen) : base;
            candidate = truncatedBase + suffix;
            counter++;
            if (counter > 999) {
                candidate = "D" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
                break;
            }
        }
        return candidate;
    }

    public DepartmentResponse mapToResponse(Department department) {
        if (department == null) return null;
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getCode(),
                department.getDescription(),
                department.getCreatedAt()
        );
    }
}
