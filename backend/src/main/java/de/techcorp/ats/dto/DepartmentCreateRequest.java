package de.techcorp.ats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DepartmentCreateRequest {

    @NotBlank(message = "Name darf nicht leer sein.")
    @Size(max = 100, message = "Name darf maximal 100 Zeichen lang sein.")
    private String name;

    @Size(max = 20, message = "Kürzel darf maximal 20 Zeichen lang sein.")
    private String code;

    private String description;

    public DepartmentCreateRequest() {}

    public DepartmentCreateRequest(String name, String code, String description) {
        this.name = name;
        this.code = code;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
