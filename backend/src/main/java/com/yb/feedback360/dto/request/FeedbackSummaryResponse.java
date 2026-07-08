package com.yb.feedback360.dto.request;

import java.time.Instant;

public record FeedbackSummaryResponse(
        Long feedbackId,
        String status,
        String moduleTitle,
        Instant createdAt,
        Double globalScore) {
}
