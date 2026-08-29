package de.techcorp.ats.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "application",
    indexes = {
        @Index(name = "idx_application_dsgvo_cron", columnList = "retention_until, is_anonymized"),
        @Index(name = "idx_application_job_status", columnList = "job_posting_id, status")
    }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_user_id")
    private User applicantUser;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "expected_salary", precision = 10, scale = 2)
    private BigDecimal expectedSalary;

    @Column(name = "earliest_starting_date")
    private LocalDate earliestStartingDate;

    @Column(name = "notice_period", length = 100)
    private String noticePeriod;

    @Column(name = "github_url", length = 255)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "cover_letter_text", columnDefinition = "TEXT")
    private String coverLetterText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.RECEIVED;

    @Column(name = "dsgvo_consent", nullable = false)
    private boolean dsgvoConsent = true;

    @Column(name = "dsgvo_consent_at", nullable = false, updatable = false)
    private LocalDateTime dsgvoConsentAt;

    @Column(name = "is_anonymized", nullable = false)
    private boolean anonymized = false;

    @Column(name = "anonymized_at")
    private LocalDateTime anonymizedAt;

    @Column(name = "retention_until", nullable = false)
    private LocalDate retentionUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationNote> notes = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();

    public Application() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.dsgvoConsentAt == null) {
            this.dsgvoConsentAt = LocalDateTime.now();
        }
        if (this.retentionUntil == null) {
            this.retentionUntil = LocalDate.now().plusDays(180);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public JobPosting getJobPosting() {
        return jobPosting;
    }

    public void setJobPosting(JobPosting jobPosting) {
        this.jobPosting = jobPosting;
    }

    public User getApplicantUser() {
        return applicantUser;
    }

    public void setApplicantUser(User applicantUser) {
        this.applicantUser = applicantUser;
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

    public LocalDateTime getDsgvoConsentAt() {
        return dsgvoConsentAt;
    }

    public void setDsgvoConsentAt(LocalDateTime dsgvoConsentAt) {
        this.dsgvoConsentAt = dsgvoConsentAt;
    }

    public boolean isAnonymized() {
        return anonymized;
    }

    public void setAnonymized(boolean anonymized) {
        this.anonymized = anonymized;
    }

    public LocalDateTime getAnonymizedAt() {
        return anonymizedAt;
    }

    public void setAnonymizedAt(LocalDateTime anonymizedAt) {
        this.anonymizedAt = anonymizedAt;
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

    public List<ApplicationDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ApplicationDocument> documents) {
        this.documents = documents;
    }

    public List<ApplicationNote> getNotes() {
        return notes;
    }

    public void setNotes(List<ApplicationNote> notes) {
        this.notes = notes;
    }

    public List<ApplicationStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
