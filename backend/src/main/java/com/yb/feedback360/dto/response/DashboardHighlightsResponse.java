package com.yb.feedback360.dto.response;

public record DashboardHighlightsResponse(
        String topCollaboratorName,
        Long topCollaboratorCount,
        String bestModuleTitle,
        Double bestModuleAverage
) {}