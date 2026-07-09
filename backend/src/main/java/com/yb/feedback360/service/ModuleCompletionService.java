package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.*;
import com.yb.feedback360.repository.*;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ModuleCompletionService {

    private final UserRepository userRepository;
    private final ParcoursRepository parcoursRepository;
    private final PopulationRepository populationRepository;
    private final ModuleFormationRepository moduleFormationRepository;
    private final FeedbackRepository feedbackRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public Feedback handleModuleCompleted(ModuleCompletedRequest request) {
        Parcours parcours = upsertParcours(request.parcours());
        Population population = upsertPopulation(request.population());
        ModuleFormation module = upsertModule(request.module(), parcours, population);
        User user = upsertUser(request.user());

        Feedback feedback = findOrCreatePendingFeedback(user, module);

        return feedbackRepository.save(feedback);
    }

    private Feedback findOrCreatePendingFeedback(User user, ModuleFormation module) {
        return feedbackRepository
                .findByUserAndModuleFormationAndStatus(user, module, FeedbackStatus.NOT_SUBMITTED)
                .orElseGet(() -> createPendingFeedback(user, module));
    }

    private Feedback createPendingFeedback(User user, ModuleFormation module) {
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setModuleFormation(module);
        feedback.setStatus(FeedbackStatus.NOT_SUBMITTED);
        feedback.setCreatedAt(Instant.now());
        return feedback;
    }

    private Parcours upsertParcours(ModuleCompletedRequest.ParcoursPayload p) {
        Parcours parcours = parcoursRepository.findByExternalParcoursId(p.id())
                .orElseGet(Parcours::new);
        parcours.setExternalParcoursId(p.id());
        parcours.setName(p.name());
        return parcoursRepository.save(parcours);
    }

    private Population upsertPopulation(ModuleCompletedRequest.PopulationPayload p) {
        Population population = populationRepository.findByExternalPopulationId(p.id())
                .orElseGet(Population::new);
        population.setExternalPopulationId(p.id());
        population.setName(p.name());
        return populationRepository.save(population);
    }

    private ModuleFormation upsertModule(ModuleCompletedRequest.ModulePayload m,
                                         Parcours parcours, Population population) {
        ModuleFormation module = moduleFormationRepository.findByExternalModuleId(m.id())
                .orElseGet(ModuleFormation::new);
        module.setExternalModuleId(m.id());
        module.setTitle(m.name());
        module.setCategory(m.type() != null ? m.type().label() : null);
        module.setParcours(parcours);
        module.setPopulation(population);
        return moduleFormationRepository.save(module);
    }

    private User upsertUser(ModuleCompletedRequest.UserPayload payload) {
        User user = userRepository.findByExternalUserId(payload.id())
                .orElseGet(() -> createUser(payload.id()));
        updateUser(user, payload);
        return userRepository.save(user);
    }

    private User createUser(Long externalUserId) {
        User user = new User();
        user.setExternalUserId(externalUserId);
        user.setRole(collaboratorRole()); // webhook users are collaborators
        return user;
    }

    private void updateUser(User user, ModuleCompletedRequest.UserPayload payload) {
        user.setEmail(payload.email());
        NameParts name = splitName(payload.fullName());
        user.setFirstName(name.firstName());
        user.setLastName(name.lastName());
    }

    private Role collaboratorRole() {
        return roleRepository.findByName("COLLABORATOR")
                .orElseThrow(() -> new IllegalStateException("Role COLLABORATOR not found"));
    }

    private NameParts splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) return new NameParts("", "");
        String trimmed = fullName.trim();
        int idx = trimmed.indexOf(' ');
        if (idx < 0) return new NameParts(trimmed, "");
        return new NameParts(trimmed.substring(0, idx), trimmed.substring(idx + 1).trim());
    }

    /** First/last name pair — clearer than a String[] with magic indices. */
    private record NameParts(String firstName, String lastName) {}
}
