package com.yb.feedback360.dto.request;

// Brouillon : la note et le commentaire sont tous deux optionnels
// (l'utilisateur peut n'avoir rempli qu'une partie).
public record DraftFeedbackRequest(
        Double globalScore,
        String comment
) {}