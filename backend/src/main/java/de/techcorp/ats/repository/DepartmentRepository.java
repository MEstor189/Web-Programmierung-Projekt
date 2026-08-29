package de.techcorp.ats.repository;

import de.techcorp.ats.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCodeIgnoreCase(String code);
    Optional<Department> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCaseOrCodeIgnoreCase(String name, String code);
}
