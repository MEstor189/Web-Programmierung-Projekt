package de.techcorp.ats.repository;

import de.techcorp.ats.entity.JobPosting;
import de.techcorp.ats.entity.JobPostingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long>, JpaSpecificationExecutor<JobPosting> {
    Optional<JobPosting> findBySlug(String slug);
    Optional<JobPosting> findByIdAndStatus(Long id, JobPostingStatus status);
    Optional<JobPosting> findBySlugAndStatus(String slug, JobPostingStatus status);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
