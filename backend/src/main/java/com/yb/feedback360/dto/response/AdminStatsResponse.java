package com.yb.feedback360.dto.response;

public record AdminStatsResponse(
        long totalUsers,
        long admins,
        long managers,
        long collaborators,
        long activeUsers,
        long inactiveUsers,
        long pendingActivation,
        long totalWebhookCalls,
        long webhookSuccess,
        long webhookFailure
) {}