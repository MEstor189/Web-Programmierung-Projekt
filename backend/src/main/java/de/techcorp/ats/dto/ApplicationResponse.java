package de.techcorp.ats.dto;

import de.techcorp.ats.entity.ApplicationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationResponse {
    private Long id;
    private Long jobPostingId;
    private String jobPostingTitle;
    private Long applicantUserId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private BigDecimal expectedSalary;
    private LocalDate earliestStartingDate;
    private String noticePeriod;
    private String githubUrl;
    private String linkedinUrl;
    private String coverLetterText;
    private ApplicationStatus status;
    private boolean dsgvoConsent;
    private boolean isAnonymized;
    private LocalDate retentionUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobPostingId() {
        return jobPostingId;
    }

    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }

    public String getJobPostingTitle() {
        return jobPostingTitle;
    }

    public void setJobPostingTitle(String jobPostingTitle) {
        this.jobPostingTitle = jobPostingTitle;
    }

    public Long getApplicantUserId() {
        return applicantUserId;
    }

    public void setApplicantUserId(Long applicantUserId) {
        this.applicantUserId = applicantUserId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BigDecimal getExpectedSalary() {
        return expectedSalary;
    }

    public void setExpectedSalary(BigDecimal expectedSalary) {
        this.expectedSalary = expectedSalary;
    }

    public LocalDate getEarliestStartingDate() {
        return earliestStartingDate;
    }

    public void setEarliestStartingDate(LocalDate earliestStartingDate) {
        this.earliestStartingDate = earliestStartingDate;
    }

    public String getNoticePeriod() {
        return noticePeriod;
    }

    public void setNoticePeriod(String noticePeriod) {
        this.noticePeriod = noticePeriod;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getCoverLetterText() {
        return coverLetterText;
    }

    public void setCoverLetterText(String coverLetterText) {
        this.coverLetterText = coverLetterText;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public boolean isDsgvoConsent() {
        return dsgvoConsent;
    }

    public void setDsgvoConsent(boolean dsgvoConsent) {
        this.dsgvoConsent = dsgvoConsent;
    }

    public boolean getIsAnonymized() {
        return isAnonymized;
    }

    public void setIsAnonymized(boolean anonymized) {
        this.isAnonymized = anonymized;
    }

    public LocalDate getRetentionUntil() {
        return retentionUntil;
    }

    public void setRetentionUntil(LocalDate retentionUntil) {
        this.retentionUntil = retentionUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
