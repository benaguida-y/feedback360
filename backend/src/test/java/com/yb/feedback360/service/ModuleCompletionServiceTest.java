package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.Role;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import com.yb.feedback360.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ModuleCompletionService — l'upsert déclenché par le webhook.
 *
 * Tous les repositories sont mockés (les `save` renvoient l'entité passée) : on teste
 * la logique métier — découpage prénom/nom, catégorie du module, et surtout le fait
 * qu'un feedback en attente existant est réutilisé au lieu d'en créer un doublon.
 */
@ExtendWith(MockitoExtension.class)
class ModuleCompletionServiceTest {

    @Mock UserRepository userRepository;
    @Mock ParcoursRepository parcoursRepository;
    @Mock PopulationRepository populationRepository;
    @Mock ModuleFormationRepository moduleFormationRepository;
    @Mock FeedbackRepository feedbackRepository;
    @Mock RoleRepository roleRepository;

    @InjectMocks
    ModuleCompletionService service;

    private ModuleCompletedRequest request(String fullName) {
        return new ModuleCompletedRequest(
                new ModuleCompletedRequest.UserPayload(7L, "alice@x.com", fullName),
                new ModuleCompletedRequest.ModulePayload(3L, "React",
                        new ModuleCompletedRequest.ModuleTypePayload(1L, "E-learning")),
                new ModuleCompletedRequest.ParcoursPayload(2L, "Parcours"),
                new ModuleCompletedRequest.PopulationPayload(4L, "Population"));
    }

    // Toutes les entités sont "nouvelles" (find -> empty), et les save renvoient l'argument.
    private void stubNewEntities() {
        when(parcoursRepository.findByExternalParcoursId(any())).thenReturn(Optional.empty());
        when(populationRepository.findByExternalPopulationId(any())).thenReturn(Optional.empty());
        when(moduleFormationRepository.findByExternalModuleId(any())).thenReturn(Optional.empty());
        when(userRepository.findByExternalUserId(any())).thenReturn(Optional.empty());
        Role role = new Role();
        role.setName("COLLABORATOR");
        when(roleRepository.findByName("COLLABORATOR")).thenReturn(Optional.of(role));
        when(parcoursRepository.save(any())).thenAnswer(returnsFirstArg());
        when(populationRepository.save(any())).thenAnswer(returnsFirstArg());
        when(moduleFormationRepository.save(any())).thenAnswer(returnsFirstArg());
        when(userRepository.save(any())).thenAnswer(returnsFirstArg());
        when(feedbackRepository.save(any())).thenAnswer(returnsFirstArg());
    }

    /** Nouvel utilisateur : nom découpé, catégorie du module posée, feedback en attente créé. */
    @Test
    void handleModuleCompleted_newUser_splitsNameAndCreatesPendingFeedback() {
        stubNewEntities();
        when(feedbackRepository.findByUserAndModuleFormationAndStatus(any(), any(), eq(FeedbackStatus.NOT_SUBMITTED)))
                .thenReturn(Optional.empty());

        Feedback fb = service.handleModuleCompleted(request("Alice Martin"));

        assertEquals(FeedbackStatus.NOT_SUBMITTED, fb.getStatus());
        assertEquals("Alice", fb.getUser().getFirstName());
        assertEquals("Martin", fb.getUser().getLastName());
        assertEquals("alice@x.com", fb.getUser().getEmail());
        assertEquals("React", fb.getModuleFormation().getTitle());
        assertEquals("E-learning", fb.getModuleFormation().getCategory());
    }

    /** Un feedback en attente existe déjà pour ce module : on le réutilise (pas de doublon). */
    @Test
    void handleModuleCompleted_reusesExistingPendingFeedback() {
        stubNewEntities();
        Feedback existing = new Feedback();
        existing.setFeedbackId(99L);
        existing.setStatus(FeedbackStatus.NOT_SUBMITTED);
        when(feedbackRepository.findByUserAndModuleFormationAndStatus(any(), any(), eq(FeedbackStatus.NOT_SUBMITTED)))
                .thenReturn(Optional.of(existing));

        Feedback fb = service.handleModuleCompleted(request("Bob"));

        assertEquals(99L, fb.getFeedbackId());
    }
}
