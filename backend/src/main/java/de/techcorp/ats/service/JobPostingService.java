package de.techcorp.ats.service;

import de.techcorp.ats.dto.JobPostingCreateRequest;
import de.techcorp.ats.dto.JobPostingResponse;
import de.techcorp.ats.dto.JobPostingUpdateRequest;
import de.techcorp.ats.dto.PaginatedResponse;
import de.techcorp.ats.entity.*;
import de.techcorp.ats.exception.BadRequestException;
import de.techcorp.ats.exception.ResourceNotFoundException;
import de.techcorp.ats.repository.DepartmentRepository;
import de.techcorp.ats.repository.JobPostingRepository;
import de.techcorp.ats.repository.UserRepository;
import de.techcorp.ats.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentService departmentService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public JobPostingService(JobPostingRepository jobPostingRepository,
                             DepartmentRepository departmentRepository,
                             UserRepository userRepository,
                             DepartmentService departmentService) {
        this.jobPostingRepository = jobPostingRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.departmentService = departmentService;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<JobPostingResponse> listJobs(
            String search,
            Long departmentId,
            EmploymentType employmentType,
            String location,
            JobPostingStatus status,
            int page,
            int pageSize,
            UserPrincipal currentUser) {

        int zeroIndexedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroIndexedPage, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<JobPosting> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Access control: Non-authenticated / Candidates only see PUBLISHED jobs
            boolean isRecruiterOrAdmin = currentUser != null &&
                    (currentUser.getRole() == Role.RECRUITER || currentUser.getRole() == Role.ADMIN);

            if (!isRecruiterOrAdmin) {
                predicates.add(cb.equal(root.get("status"), JobPostingStatus.PUBLISHED));
            } else if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate reqMatch = cb.like(cb.lower(root.get("requirements")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch, reqMatch));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<JobPosting> jobPage = jobPostingRepository.findAll(spec, pageable);

        List<JobPostingResponse> items = jobPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                items,
                jobPage.getTotalElements(),
                page,
                pageSize,
                Math.max(1, jobPage.getTotalPages())
        );
    }

    @Transactional(readOnly = true)
    public JobPostingResponse getJobByIdOrSlug(String idOrSlug, UserPrincipal currentUser) {
        JobPosting job;

        if (idOrSlug.matches("\\d+")) {
            Long id = Long.parseLong(idOrSlug);
            job = jobPostingRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Stellenanzeige nicht gefunden."));
        } else {
            job = jobPostingRepository.findBySlug(idOrSlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Stellenanzeige nicht gefunden."));
        }

        // Privacy Isolation (ADR 0010): Draft / Archived jobs return 404 to guests
        boolean isRecruiterOrAdmin = currentUser != null &&
                (currentUser.getRole() == Role.RECRUITER || currentUser.getRole() == Role.ADMIN);

        if (job.getStatus() != JobPostingStatus.PUBLISHED && !isRecruiterOrAdmin) {
            throw new ResourceNotFoundException("Stellenanzeige nicht gefunden.");
        }

        return mapToResponse(job);
    }

    @Transactional
    public JobPostingResponse createJob(JobPostingCreateRequest request, UserPrincipal currentUser) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new BadRequestException("Ungültige department_id."));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Benutzer nicht gefunden."));

        String baseSlug = toSlug(request.getTitle());
        String slug = baseSlug;
        int counter = 1;
        while (jobPostingRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        JobPosting job = new JobPosting();
        job.setTitle(request.getTitle().trim());
        job.setSlug(slug);
        job.setDepartment(department);
        job.setLocation(request.getLocation().trim());
        job.setEmploymentType(request.getEmploymentType());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setBenefits(request.getBenefits());
        job.setStatus(request.getStatus() != null ? request.getStatus() : JobPostingStatus.DRAFT);
        job.setCreator(user);

        if (job.getStatus() == JobPostingStatus.PUBLISHED) {
            job.setPublishedAt(LocalDateTime.now());
        }

        JobPosting saved = jobPostingRepository.save(job);
        return mapToResponse(saved);
    }

    @Transactional
    public JobPostingResponse updateJob(Long id, JobPostingUpdateRequest request, UserPrincipal currentUser) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stellenanzeige nicht gefunden."));

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Ungültige department_id."));
            job.setDepartment(department);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty() && !request.getTitle().equals(job.getTitle())) {
            job.setTitle(request.getTitle().trim());
            String baseSlug = toSlug(request.getTitle());
            String slug = baseSlug;
            int counter = 1;
            while (jobPostingRepository.existsBySlugAndIdNot(slug, id)) {
                slug = baseSlug + "-" + counter;
                counter++;
            }
            job.setSlug(slug);
        }

        if (request.getLocation() != null) job.setLocation(request.getLocation().trim());
        if (request.getEmploymentType() != null) job.setEmploymentType(request.getEmploymentType());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());

        if (request.getStatus() != null) {
            if (request.getStatus() == JobPostingStatus.PUBLISHED && job.getStatus() != JobPostingStatus.PUBLISHED) {
                job.setPublishedAt(LocalDateTime.now());
            }
            job.setStatus(request.getStatus());
        }

        JobPosting updated = jobPostingRepository.save(job);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteOrArchiveJob(Long id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stellenanzeige nicht gefunden."));

        if (job.getApplications() != null && !job.getApplications().isEmpty()) {
            // Soft-Archiving (ADR 0006)
            job.setStatus(JobPostingStatus.ARCHIVED);
            jobPostingRepository.save(job);
        } else {
            jobPostingRepository.delete(job);
        }
    }

    public JobPostingResponse mapToResponse(JobPosting job) {
        if (job == null) return null;
        JobPostingResponse response = new JobPostingResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setSlug(job.getSlug());
        response.setDepartmentId(job.getDepartment().getId());
        response.setDepartment(departmentService.mapToResponse(job.getDepartment()));
        response.setLocation(job.getLocation());
        response.setEmploymentType(job.getEmploymentType());
        response.setDescription(job.getDescription());
        response.setRequirements(job.getRequirements());
        response.setBenefits(job.getBenefits());
        response.setStatus(job.getStatus());
        response.setCreatedByUserId(job.getCreator().getId());
        response.setPublishedAt(job.getPublishedAt());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        return response;
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input.trim().toLowerCase(Locale.ROOT)).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
