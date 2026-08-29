package de.techcorp.ats.dto;

import java.util.ArrayList;
import java.util.List;

public class ApplicationDetailResponse extends ApplicationResponse {
    private List<ApplicationDocumentResponse> documents = new ArrayList<>();
    private List<ApplicationNoteResponse> notes = new ArrayList<>();
    private List<ApplicationStatusHistoryResponse> statusHistory = new ArrayList<>();

    public ApplicationDetailResponse() {
        super();
    }

    public List<ApplicationDocumentResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ApplicationDocumentResponse> documents) {
        this.documents = documents;
    }

    public List<ApplicationNoteResponse> getNotes() {
        return notes;
    }

    public void setNotes(List<ApplicationNoteResponse> notes) {
        this.notes = notes;
    }

    public List<ApplicationStatusHistoryResponse> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistoryResponse> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
