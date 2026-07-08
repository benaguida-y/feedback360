package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.*;
import com.yb.feedback360.repository.*;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ModuleCompletionService {

    private final UserRepository userRepository;
    private final ParcoursRepository parcoursRepository;
    private final PopulationRepository populationRepository;
    private final ModuleFormationRepository moduleFormationRepository;
    private final FeedbackRepository feedbackRepository;
    private final RoleRepository roleRepository;

    public ModuleCompletionService(UserRepository userRepository,
                                   ParcoursRepository parcoursRepository,
                                   PopulationRepository populationRepository,
                                   ModuleFormationRepository moduleFormationRepository,
                                   FeedbackRepository feedbackRepository,
                                   RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.parcoursRepository = parcoursRepository;
        this.populationRepository = populationRepository;
        this.moduleFormationRepository = moduleFormationRepository;
        this.feedbackRepository = feedbackRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public Feedback handleModuleCompleted(ModuleCompletedRequest req) {
        Parcours parcours = upsertParcours(req.parcours());
        Population population = upsertPopulation(req.population());
        ModuleFormation module = upsertModule(req.module(), parcours, population);
        User user = upsertUser(req.user());
        // if a pending feedback for that user&module exists it's reused else new one is created
        Feedback feedback = feedbackRepository
                .findByUserAndModuleFormationAndStatus(user, module, FeedbackStatus.NOT_SUBMITTED)
                .orElseGet(() -> {
                    Feedback f = new Feedback();
                    f.setUser(user);
                    f.setModuleFormation(module);
                    f.setStatus(FeedbackStatus.NOT_SUBMITTED);
                    f.setCreatedAt(Instant.now());
                    return f;
                });
        return feedbackRepository.save(feedback);
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