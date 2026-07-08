package com.yb.feedback360.dto.response;

import java.time.Instant;
import java.util.List;

public record FeedbackDetailResponse(
        Long feedbackId,
        String status,
        String moduleTitle,
        Instant createdAt,
        Double globalScore,
        String comment,
        List<String> answers
) {}
