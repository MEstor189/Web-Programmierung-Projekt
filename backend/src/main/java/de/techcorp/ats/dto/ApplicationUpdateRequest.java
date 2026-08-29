package de.techcorp.ats.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ApplicationUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private BigDecimal expectedSalary;
    private LocalDate earliestStartingDate;
    private String noticePeriod;
    private String githubUrl;
    private String linkedinUrl;
    private String coverLetterText;

    public ApplicationUpdateRequest() {}

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
}
