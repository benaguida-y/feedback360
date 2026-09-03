package com.yb.feedback360.dto.response;

// Agrégats de l'équipe pour le donut + KPIs de la page Collaborateurs.
public record CollaboratorsSummaryResponse(
        long total,
        long done,
        long inProgress,
        long none,
        int avgProgress
) {}