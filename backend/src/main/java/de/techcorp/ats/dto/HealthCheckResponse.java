package de.techcorp.ats.dto;

public class HealthCheckResponse {
    private String status;
    private String database;
    private String version;

    public HealthCheckResponse() {}

    public HealthCheckResponse(String status, String database, String version) {
        this.status = status;
        this.database = database;
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
