package com.yb.feedback360.dto.response;

import java.time.Instant;

public record ManagementFeedbackSummaryResponse(
        Long feedbackId,
        String status,
        String moduleTitle,
        Instant createdAt,
        Double globalScore,
        String collaboratorName,
        String collaboratorEmail
) {}