package com.yb.feedback360.dto.response;

public record DashboardSummaryResponse(
        Long total,
        Long submitted,
        Long notSubmitted,
        Long inProgress
) {
}
