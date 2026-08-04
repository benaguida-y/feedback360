package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.response.*;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagementService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getGlobalSummary() {
        long total = feedbackRepository.count();
        long submitted = feedbackRepository.countByStatus(FeedbackStatus.SUBMITTED);
        long notSubmitted = feedbackRepository.countByStatus(FeedbackStatus.NOT_SUBMITTED);
        long inProgress = feedbackRepository.countByStatus(FeedbackStatus.IN_PROGRESS);

        return new DashboardSummaryResponse(total, submitted, notSubmitted, inProgress);
    }

    @Transactional(readOnly = true)
    public PageResponse<ManagementFeedbackSummaryResponse> getAllFeedbacks(FeedbackStatus status, String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";

        return PageResponse.from(
                feedbackRepository.searchFeedbacks(status, searchParam, pageable).map(f -> {
                    User u = f.getUser();
                    String name = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                            (u.getLastName() != null ? u.getLastName() : "")).trim();
                    if (name.isBlank()) {
                        name = u.getEmail();
                    }
                    return new ManagementFeedbackSummaryResponse(
                            f.getFeedbackId(), f.getStatus().name(), f.getModuleFormation().getTitle(),
                            f.getCreatedAt(), f.getGlobalScore(), name);
                }));
    }

    @Transactional
    public ManagementStatsResponse getStats() {
        long total = feedbackRepository.count();
        long submitted = feedbackRepository.countByStatus(FeedbackStatus.SUBMITTED);

        double submissionRate = 0.0;
        if (total != 0) {
            submissionRate = (double) submitted / total;
        }

        Double averageScore = feedbackRepository.averageScore(FeedbackStatus.SUBMITTED);

        // Le dashboard a besoin de TOUS les modules → requête non paginée.
        List<ModuleStatsResponse> perModule = feedbackRepository
                .moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, null, Pageable.unpaged())
                .getContent();

        int submissionRatePercent = (int) Math.round(submissionRate * 100);
        return new ManagementStatsResponse(total, submitted, submissionRate, submissionRatePercent, averageScore, perModule);
    }

    // Pas de contrôle de propriétaire ici : l'accès est déjà réservé
    // aux rôles MANAGER/ADMIN par SecurityConfig sur /api/management/**.
    @Transactional(readOnly = true)
    public ManagementFeedbackDetailResponse getFeedback(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));

        User user = feedback.getUser();
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                (user.getLastName() != null ? user.getLastName() : "")).trim();

        return new ManagementFeedbackDetailResponse(
                feedback.getFeedbackId(),
                feedback.getStatus().name(),
                feedback.getModuleFormation().getTitle(),
                feedback.getCreatedAt(),
                feedback.getGlobalScore(),
                feedback.getComment(),
                name.isBlank() ? user.getEmail() : name,
                user.getEmail());
    }

    // Liste paginée + recherche (nom / email), filtrée en base.
    @Transactional(readOnly = true)
    public PageResponse<CollaboratorProgressResponse> getCollaborators(String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(feedbackRepository.collaboratorProgress(
                FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, searchParam, pageable));
    }

    // Liste paginée + recherche (titre du module), filtrée en base.
    @Transactional(readOnly = true)
    public PageResponse<ModuleStatsResponse> getModules(String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(feedbackRepository.moduleStats(
                FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, searchParam, pageable));
    }

    @Transactional(readOnly = true)
    public CollaboratorDetailResponse getCollaborator(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<FeedbackSummaryResponse> feedbacks = feedbackRepository
                .findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(FeedbackSummaryResponse::from)
                .toList();

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (fullName.isBlank()) {
            fullName = user.getEmail();
        }
        return new CollaboratorDetailResponse(user.getUserId(), fullName, user.getEmail(), feedbacks);
    }

    @Transactional(readOnly = true)
    public DashboardHighlightsResponse getHighlights() {
        // Collaborateur le plus actif : le plus de feedbacks soumis (sur TOUS les collaborateurs).
        var top = feedbackRepository
                .collaboratorProgress(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, null, Pageable.unpaged())
                .getContent().stream()
                .filter(c -> c.submitted() != null && c.submitted() > 0)
                .max(Comparator.comparingLong(CollaboratorProgressResponse::submitted))
                .orElse(null);

        // Module le mieux noté : meilleure note moyenne (sur TOUS les modules).
        ModuleStatsResponse best = feedbackRepository
                .moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, null, Pageable.unpaged())
                .getContent().stream()
                .filter(m -> m.averageScore() != null)
                .max(Comparator.comparingDouble(ModuleStatsResponse::averageScore))
                .orElse(null);

        return new DashboardHighlightsResponse(
                top != null ? top.fullName() : null,
                top != null ? top.submitted() : null,
                best != null ? best.moduleTitle() : null,
                best != null ? best.averageScore() : null);
    }
}