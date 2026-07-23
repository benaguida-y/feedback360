package com.yb.feedback360.dto.response;

import java.util.List;

public record ManagementStatsResponse(
        long totalFeedbacks,
        long submittedFeedbacks,
        double submissionRate,
        Double averageScore,
        List<ModuleStatsResponse> perModule
) {
}
