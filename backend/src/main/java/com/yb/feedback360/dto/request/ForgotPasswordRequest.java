package com.yb.feedback360.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Demande de reinitialisation de mot de passe (mot de passe oublie).
public record ForgotPasswordRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email is invalid") String email
) {}
