package com.yb.feedback360.dto.response;

import org.hibernate.annotations.Imported;

@Imported
public record ModuleStatsResponse(
        String moduleTitle,
        Long submittedCount,
        Long notSubmittedCount,
        Double averageScore
) {
}
