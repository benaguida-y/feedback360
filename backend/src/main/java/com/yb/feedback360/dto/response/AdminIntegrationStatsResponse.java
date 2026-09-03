package com.yb.feedback360.dto.response;

public record AdminIntegrationStatsResponse(
        long totalWebhookCalls,
        long webhookSuccess,
        long webhookFailure
) {}
