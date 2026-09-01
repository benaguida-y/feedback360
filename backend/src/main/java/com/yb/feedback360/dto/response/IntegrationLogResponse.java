package com.yb.feedback360.dto.response;

import java.time.Instant;

public record IntegrationLogResponse(
        Long logId,
        String type,
        String status,
        Instant receivedAt,
        Instant processedAt,
        String userEmail,
        String moduleTitle,
        String errorMessage
) {}