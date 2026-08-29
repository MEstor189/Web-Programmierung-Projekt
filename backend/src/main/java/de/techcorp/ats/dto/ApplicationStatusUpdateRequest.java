package de.techcorp.ats.dto;

import jakarta.validation.constraints.NotBlank;

public class ApplicationStatusUpdateRequest {

    @NotBlank(message = "Status darf nicht leer sein.")
    private String status;

    private String reason;

    public ApplicationStatusUpdateRequest() {}

    public ApplicationStatusUpdateRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
