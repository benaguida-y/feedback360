package com.yb.feedback360.service;

import com.yb.feedback360.dto.response.CollaboratorProgressResponse;
import com.yb.feedback360.dto.response.CollaboratorsSummaryResponse;
import com.yb.feedback360.dto.response.RatingDistributionResponse;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ManagementService — les agrégats calculés côté serveur.
 *
 * Le repository est mocké : on teste la LOGIQUE de regroupement (donut d'équipe,
 * distribution des notes) sans base de données ni requête réelle.
 */
@ExtendWith(MockitoExtension.class)
class ManagementServiceTest {

    @Mock
    FeedbackRepository feedbackRepository;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    ManagementService service;

    // Une ligne de progression collaborateur avec un % de feedbacks soumis donné.
    private CollaboratorProgressResponse collab(long percent) {
        return new CollaboratorProgressResponse(1L, "N", "e@x.com", 10L, 5L, 5L, percent, null);
    }

    // --- getCollaboratorsSummary --------------------------------------------

    /** Mix terminé / rien / en cours : bon comptage par catégorie + moyenne arrondie. */
    @Test
    void getCollaboratorsSummary_bucketsAndAverages() {
        List<CollaboratorProgressResponse> all = List.of(collab(100), collab(100), collab(0), collab(50));
        when(feedbackRepository.collaboratorProgress(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(all));

        CollaboratorsSummaryResponse s = service.getCollaboratorsSummary();

        assertEquals(4, s.total());
        assertEquals(2, s.done());        // 100 %
        assertEquals(1, s.none());        // 0 %
        assertEquals(1, s.inProgress());  // le reste
        assertEquals(63, s.avgProgress()); // (100+100+0+50)/4 = 62,5 -> 63
    }

    /** Équipe vide : tout à zéro, pas de division par zéro. */
    @Test
    void getCollaboratorsSummary_emptyTeam_returnsZeros() {
        when(feedbackRepository.collaboratorProgress(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        CollaboratorsSummaryResponse s = service.getCollaboratorsSummary();

        assertEquals(0, s.total());
        assertEquals(0, s.avgProgress());
    }

    // --- getRatingDistribution ----------------------------------------------

    /** Les notes sont arrondies puis rangées dans 5 cases (1★..5★). */
    @Test
    void getRatingDistribution_roundsAndBuckets() {
        when(feedbackRepository.findScoresForDistribution(any(), any()))
                .thenReturn(List.of(5.0, 4.4, 4.6, 1.0, 3.0)); // arrondis -> 5,4,5,1,3

        RatingDistributionResponse r = service.getRatingDistribution(null, null);

        assertEquals(List.of(1L, 0L, 1L, 1L, 2L), r.counts());
    }
}
