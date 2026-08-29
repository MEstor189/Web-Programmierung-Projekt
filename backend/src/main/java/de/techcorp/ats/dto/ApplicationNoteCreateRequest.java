package de.techcorp.ats.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApplicationNoteCreateRequest {

    @Min(value = 1, message = "Bewertung muss zwischen 1 und 5 liegen.")
    @Max(value = 5, message = "Bewertung muss zwischen 1 und 5 liegen.")
    private Integer rating;

    @NotBlank(message = "Notizinhalt darf nicht leer sein.")
    private String content;

    @NotNull(message = "AGG-Bestätigung ist verpflichtend.")
    private Boolean aggDisclaimerConfirmed;

    public ApplicationNoteCreateRequest() {}

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

    public Boolean getAggDisclaimerConfirmed() {
        return aggDisclaimerConfirmed;
    }

    public void setAggDisclaimerConfirmed(Boolean aggDisclaimerConfirmed) {
        this.aggDisclaimerConfirmed = aggDisclaimerConfirmed;
    }
}
