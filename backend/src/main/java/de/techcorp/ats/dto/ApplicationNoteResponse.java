package de.techcorp.ats.dto;

import java.time.LocalDateTime;

public class ApplicationNoteResponse {
    private Long id;
    private Long applicationId;
    private Long userId;
    private String authorName;
    private Integer rating;
    private String content;
    private boolean aggDisclaimerConfirmed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationNoteResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isAggDisclaimerConfirmed() {
        return aggDisclaimerConfirmed;
    }

    public void setAggDisclaimerConfirmed(boolean aggDisclaimerConfirmed) {
        this.aggDisclaimerConfirmed = aggDisclaimerConfirmed;
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
