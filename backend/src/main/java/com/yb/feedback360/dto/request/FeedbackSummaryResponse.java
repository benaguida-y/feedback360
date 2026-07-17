package com.yb.feedback360.dto.request;

import com.yb.feedback360.domain.model.Feedback;

import java.time.Instant;

public record FeedbackSummaryResponse(
        Long feedbackId,
        String status,
        String moduleTitle,
        Instant createdAt,
        Double globalScore) {

    public static FeedbackSummaryResponse from(Feedback feedback) {
        return new FeedbackSummaryResponse(
                feedback.getFeedbackId(),
                feedback.getStatus().name(),
                feedback.getModuleFormation().getTitle(),
                feedback.getCreatedAt(),
                feedback.getGlobalScore()
        );
    }
}
