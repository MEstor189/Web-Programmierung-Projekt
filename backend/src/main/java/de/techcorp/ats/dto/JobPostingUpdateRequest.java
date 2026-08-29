package de.techcorp.ats.dto;

import de.techcorp.ats.entity.EmploymentType;
import de.techcorp.ats.entity.JobPostingStatus;

public class JobPostingUpdateRequest {
    private String title;
    private Long departmentId;
    private String location;
    private EmploymentType employmentType;
    private String description;
    private String requirements;
    private String benefits;
    private JobPostingStatus status;

    public JobPostingUpdateRequest() {}

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
