package de.techcorp.ats.repository;

import de.techcorp.ats.entity.Application;
import de.techcorp.ats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {
    
    List<Application> findByApplicantUserIdOrEmailIgnoreCaseOrderByCreatedAtDesc(Long applicantUserId, String email);
    
    List<Application> findByRetentionUntilLessThanEqualAndAnonymizedFalse(LocalDate date);

    @Modifying
    @Query("UPDATE Application a SET a.applicantUser = :user WHERE LOWER(a.email) = LOWER(:email) AND a.applicantUser IS NULL")
    int linkGuestApplicationsToUser(@Param("email") String email, @Param("user") User user);
}
