package com.yb.feedback360.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ActivateRequest(@NotBlank String token, @NotBlank String password) {}