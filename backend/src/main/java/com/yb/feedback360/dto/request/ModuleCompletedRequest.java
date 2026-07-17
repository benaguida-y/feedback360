package com.yb.feedback360.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModuleCompletedRequest(
        @NotNull(message = "user is required") @Valid UserPayload user,
        @NotNull(message = "module is required") @Valid ModulePayload module,
        @NotNull(message = "parcours is required") @Valid ParcoursPayload parcours,
        @NotNull(message = "population is required") @Valid PopulationPayload population
) {
    public record UserPayload(
            @NotNull(message = "user.id is required") Long id,
            @NotBlank(message = "user.email is required") @Email(message = "user.email is invalid") String email,
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
