package de.techcorp.ats.repository;

import de.techcorp.ats.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    Optional<ApplicationDocument> findByIdAndApplicationId(Long id, Long applicationId);
    List<ApplicationDocument> findByApplicationId(Long applicationId);
}
