package de.techcorp.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CandidateRegisterRequest {

    @NotBlank(message = "E-Mail darf nicht leer sein.")
    @Email(message = "Ungültiges E-Mail-Format.")
    private String email;

    @NotBlank(message = "Passwort darf nicht leer sein.")
    @Size(min = 6, message = "Passwort muss mindestens 6 Zeichen lang sein.")
    private String password;

    @NotBlank(message = "Vorname darf nicht leer sein.")
    private String firstName;

    @NotBlank(message = "Nachname darf nicht leer sein.")
    private String lastName;

    public CandidateRegisterRequest() {}

    public CandidateRegisterRequest(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
