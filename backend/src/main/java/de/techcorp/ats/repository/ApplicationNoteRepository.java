package de.techcorp.ats.repository;

import de.techcorp.ats.entity.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {
    List<ApplicationNote> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
    Optional<ApplicationNote> findByIdAndApplicationId(Long id, Long applicationId);
}
