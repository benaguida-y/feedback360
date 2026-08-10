package com.yb.feedback360.dto.response;

import com.yb.feedback360.dto.request.FeedbackSummaryResponse;

import java.util.List;

// Fiche d'un collaborateur : son identité + la liste de ses modules/feedbacks.
public record CollaboratorDetailResponse(
        Long userId,
        String fullName,
        String email,
        List<FeedbackSummaryResponse> feedbacks
) {}