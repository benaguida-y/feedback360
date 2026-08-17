package com.yb.feedback360.dto.response;

public record AdminUserStatsResponse(
        long totalUsers,
        long admins,
        long managers,
        long collaborators,
        long activeUsers,
        long inactiveUsers,
        long pendingActivation
) {}
