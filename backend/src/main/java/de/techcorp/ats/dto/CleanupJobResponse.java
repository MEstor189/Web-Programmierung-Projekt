package de.techcorp.ats.dto;

public class CleanupJobResponse {
    private String status;
    private int processedCount;
    private String executionTime;

    public CleanupJobResponse() {}

    public CleanupJobResponse(String status, int processedCount, String executionTime) {
        this.status = status;
        this.processedCount = processedCount;
        this.executionTime = executionTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getProcessedCount() {
        return processedCount;
    }

    public void setProcessedCount(int processedCount) {
        this.processedCount = processedCount;
    }

    public String getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(String executionTime) {
        this.executionTime = executionTime;
    }
}
