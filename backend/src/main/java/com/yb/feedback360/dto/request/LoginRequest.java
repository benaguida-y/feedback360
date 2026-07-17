package com.yb.feedback360.dto.request;

import com.yb.feedback360.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String email, @NotBlank String password) {
}
