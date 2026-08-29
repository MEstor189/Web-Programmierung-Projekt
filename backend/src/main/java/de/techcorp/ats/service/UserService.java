package de.techcorp.ats.service;

import de.techcorp.ats.dto.PaginatedResponse;
import de.techcorp.ats.dto.UserCreateRequest;
import de.techcorp.ats.dto.UserResponse;
import de.techcorp.ats.dto.UserUpdateRequest;
import de.techcorp.ats.entity.Department;
import de.techcorp.ats.entity.Role;
import de.techcorp.ats.entity.User;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.ResourceNotFoundException;
import de.techcorp.ats.repository.DepartmentRepository;
import de.techcorp.ats.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserService(UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       AuthService authService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<UserResponse> listUsers(Role role, int page, int pageSize) {
        int zeroIndexedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroIndexedPage, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> userPage;
        if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserResponse> items = userPage.getContent()
                .stream()
                .map(authService::mapToUserResponse)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                items,
                userPage.getTotalElements(),
                page,
                pageSize,
                Math.max(1, userPage.getTotalPages())
        );
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Ungültiges Fachbereich ID."));
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(request.getRole());
        user.setDepartment(department);
        user.setActive(request.getIsActive());

        User saved = userRepository.save(user);
        return authService.mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden."));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setActive(request.getIsActive());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Ungültiges Fachbereich ID."));
            user.setDepartment(department);
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        return authService.mapToUserResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden."));
        userRepository.delete(user);
    }
}
