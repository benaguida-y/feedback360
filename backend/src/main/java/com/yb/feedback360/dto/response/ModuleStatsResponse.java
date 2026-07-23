package com.yb.feedback360.dto.response;

public record ModuleStatsResponse(
        String moduleTitle,
        Long submittedCount,
        Long notSubmittedCount,
        Double averageScore
) {
}
