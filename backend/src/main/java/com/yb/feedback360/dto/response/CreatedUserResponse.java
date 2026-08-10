package com.yb.feedback360.dto.response;

public record CreatedUserResponse(
        Long userId,
        String email,
        String role,
        String activationLink
) {
}
