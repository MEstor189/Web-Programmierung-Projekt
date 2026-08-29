package de.techcorp.ats.service;

import de.techcorp.ats.dto.CandidateRegisterRequest;
import de.techcorp.ats.dto.TokenResponse;
import de.techcorp.ats.dto.UserResponse;
import de.techcorp.ats.entity.Role;
import de.techcorp.ats.entity.User;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.UnauthorizedException;
import de.techcorp.ats.repository.ApplicationRepository;
import de.techcorp.ats.repository.UserRepository;
import de.techcorp.ats.security.JwtTokenProvider;
import de.techcorp.ats.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final DepartmentService departmentService;

    public AuthService(UserRepository userRepository,
                       ApplicationRepository applicationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       DepartmentService departmentService) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.departmentService = departmentService;
    }

    @Transactional(readOnly = true)
    public TokenResponse login(String email, String password) {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UnauthorizedException("Ungültige E-Mail-Adresse oder Passwort."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Ungültige E-Mail-Adresse oder Passwort.");
        }

        if (!user.isActive()) {
            throw new BadRequestException("Benutzerkonto ist deaktiviert.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new TokenResponse(token, "bearer");
    }

    @Transactional
    public UserResponse registerCandidate(CandidateRegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Ein Konto mit dieser E-Mail-Adresse existiert bereits.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(Role.CANDIDATE);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Auto-linking of previous guest applications matching the email (ADR 0003)
        applicationRepository.linkGuestApplicationsToUser(email, savedUser);

        return mapToUserResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Benutzerprofil nicht gefunden."));
        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        if (user.getDepartment() != null) {
            response.setDepartmentId(user.getDepartment().getId());
            response.setDepartment(departmentService.mapToResponse(user.getDepartment()));
        }
        response.setIsActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
