package com.yb.feedback360.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Le rejet des champs hors-contrat est assuré globalement par
// spring.jackson.deserialization.fail-on-unknown-properties=true (voir application.yaml).
public record ModuleCompletedRequest(
        @NotNull(message = "user is required") @Valid UserPayload user,
        @NotNull(message = "module is required") @Valid ModulePayload module,
        @NotNull(message = "parcours is required") @Valid ParcoursPayload parcours,
        @NotNull(message = "population is required") @Valid PopulationPayload population
) {
    // Domaine avec au moins un point et un TLD de 2+ lettres : "a@x" est rejeté, "a@x.com" accepté.
    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    public record UserPayload(
            @NotNull(message = "user.id is required") Long id,
            @NotBlank(message = "user.email is required")
            @Email(regexp = EMAIL_REGEX, message = "user.email is invalid") String email,
            @NotBlank(message = "user.fullName is required") String fullName) {}

    public record ModulePayload(
            @NotNull(message = "module.id is required") Long id,
            @NotBlank(message = "module.name is required") String name,
            @Valid ModuleTypePayload type) {}

    public record ModuleTypePayload(Long id, String label) {}

    public record ParcoursPayload(
            @NotNull(message = "parcours.id is required") Long id,
            @NotBlank(message = "parcours.name is required") String name) {}

    public record PopulationPayload(
            @NotNull(message = "population.id is required") Long id,
            @NotBlank(message = "population.name is required") String name) {}
}
