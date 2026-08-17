package com.yb.feedback360.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MagicLoginRequest(@NotBlank String token) {
}