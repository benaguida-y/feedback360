package com.yb.feedback360.dto.response;

import java.util.List;

// Synthese IA des commentaires d'un module.
//  available = false -> IA indisponible (erreur/pas de reponse) ; l'UI degrade proprement.
public record ModuleInsightsResponse(
        boolean available,
        int commentCount,
        String summary,
        SentimentBreakdown sentiment,
        List<String> themes
) {}