package com.yb.feedback360.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Le rejet des champs hors-contrat est assuré globalement par
// spring.jackson.deserialization.fail-on-unknown-properties=true (voir application.yaml).
public record ModuleCompletedRequest(
        @NotNull(message = "User is required") @Valid UserPayload user,
        @NotNull(message = "Module is required") @Valid ModulePayload module,
        @NotNull(message = "Parcours is required") @Valid ParcoursPayload parcours,
        @NotNull(message = "Population is required") @Valid PopulationPayload population
) {
    // Domaine avec au moins un point et un TLD de 2+ lettres : "a@x" est rejeté, "a@x.com" accepté.
    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    public record UserPayload(
            @NotNull(message = "User id is required") Long id,
            @NotBlank(message = "User email is required")
            @Email(regexp = EMAIL_REGEX, message = "User email is invalid") String email,
            @NotBlank(message = "User full name is required") String fullName) {}

    public record ModulePayload(
            @NotNull(message = "Module id is required") Long id,
            @NotBlank(message = "Module name is required") String name,
            @NotNull(message = "Module type is required") @Valid ModuleTypePayload type) {}

    public record ModuleTypePayload(
            @NotNull(message = "Module type id is required") Long id,
            @NotBlank(message = "Module type label is required") String label) {}

    public record ParcoursPayload(
            @NotNull(message = "Parcours id is required") Long id,
            @NotBlank(message = "Parcours name is required") String name) {}

    public record PopulationPayload(
            @NotNull(message = "Population id is required") Long id,
            @NotBlank(message = "Population name is required") String name) {}
}