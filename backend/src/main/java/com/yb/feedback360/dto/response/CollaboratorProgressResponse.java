package com.yb.feedback360.dto.response;

import org.hibernate.annotations.Imported;

// Une ligne de la liste des collaborateurs : progression agrégée de ses feedbacks.
@Imported
public record CollaboratorProgressResponse(
        Long userId,
        String fullName,
        String email,
        Long total,
        Long submitted,
        Long notSubmitted,
        Long submittedPercent,
        Double averageScore
) {}