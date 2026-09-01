package com.yb.feedback360.dto.response;

public record AdminUserDetailResponse(
        Long userId,
        String email,
        String fullName,
        String role,
        boolean active,
        boolean activated,
        String department,
        Long externalUserId
) {}