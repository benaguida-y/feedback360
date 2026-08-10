package com.yb.feedback360.dto.response;

import java.time.Instant;

public record ManagementFeedbackDetailResponse(
        Long feedbackId,
        String status,
        String moduleTitle,
        Instant createdAt,
        Double globalScore,
        String comment,
        String collaboratorName,
        String collaboratorEmail
) {
}
