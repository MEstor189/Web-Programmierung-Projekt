package de.techcorp.ats.dto;

import de.techcorp.ats.entity.EmploymentType;
import de.techcorp.ats.entity.JobPostingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class JobPostingCreateRequest {

    @NotBlank(message = "Titel darf nicht leer sein.")
    @Size(max = 200, message = "Titel darf maximal 200 Zeichen lang sein.")
    private String title;

    @NotNull(message = "Fachbereich (department_id) ist erforderlich.")
    private Long departmentId;

    @NotBlank(message = "Standort darf nicht leer sein.")
    @Size(max = 100, message = "Standort darf maximal 100 Zeichen lang sein.")
    private String location;

    @NotNull(message = "Anstellungsart (employment_type) ist erforderlich.")
    private EmploymentType employmentType;

    @NotBlank(message = "Beschreibung darf nicht leer sein.")
    private String description;

    @NotBlank(message = "Anforderungen dürfen nicht leer sein.")
    private String requirements;

    private String benefits;

    private JobPostingStatus status = JobPostingStatus.DRAFT;

    public JobPostingCreateRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public JobPostingStatus getStatus() {
        return status;
    }

    public void setStatus(JobPostingStatus status) {
        this.status = status;
    }
}
