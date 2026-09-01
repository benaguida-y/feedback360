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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    public PageResponse<ManagementFeedbackSummaryResponse> getAllFeedbacks(FeedbackStatus status, Integer score, String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";

        return PageResponse.from(
                feedbackRepository.searchFeedbacks(status, score, searchParam, pageable).map(f -> {
                    User u = f.getUser();
                    String name = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                            (u.getLastName() != null ? u.getLastName() : "")).trim();
                    if (name.isBlank()) {
                        name = u.getEmail();
                    }
                    return new ManagementFeedbackSummaryResponse(
                            f.getFeedbackId(), f.getStatus().name(), f.getModuleFormation().getTitle(),
                            f.getCreatedAt(), f.getGlobalScore(), name, u.getEmail());
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
                .moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, FeedbackStatus.IN_PROGRESS, null, Pageable.unpaged())
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

    // Liste + recherche (nom / email). Les colonnes sont des agrégats non triables en JPQL :
    // on récupère tout, on trie en mémoire selon le tri demandé, puis on pagine.
    @Transactional(readOnly = true)
    public PageResponse<CollaboratorProgressResponse> getCollaborators(String search, Integer score, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";
        List<CollaboratorProgressResponse> all = feedbackRepository
                .collaboratorProgress(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, searchParam, Pageable.unpaged())
                .getContent().stream()
                .filter(c -> matchesRange(c.averageScore(), score))
                .toList();
        return paginate(sortCollaborators(all, pageable.getSort()), pageable);
    }

    // Idem : agrégats par module, triés en mémoire puis paginés.
    @Transactional(readOnly = true)
    public PageResponse<ModuleStatsResponse> getModules(String search, Integer score, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";
        List<ModuleStatsResponse> all = feedbackRepository
                .moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, FeedbackStatus.IN_PROGRESS, searchParam, Pageable.unpaged())
                .getContent().stream()
                .filter(m -> matchesStar(m.averageScore(), score))
                .toList();
        return paginate(sortModules(all, pageable.getSort()), pageable);
    }

    // Modules : la note est une étoile. Filtre par étoile exacte (arrondi) :
    // 1-5 = étoile, 0 = sans note, null = toutes.
    private boolean matchesStar(Double avg, Integer star) {
        if (star == null) return true;
        if (star == 0) return avg == null;
        return avg != null && (int) Math.round(avg) == star;
    }

    // Collaborateurs : la note est un flottant. Filtre par plage [floor, floor+1[
    // (4 = plage haute 4–5 inclus), 0 = sans note, null = toutes.
    private boolean matchesRange(Double avg, Integer floor) {
        if (floor == null) return true;
        if (floor == 0) return avg == null;
        if (avg == null) return false;
        if (floor >= 4) return avg >= 4.0;
        return avg >= floor && avg < floor + 1;
    }

    private List<ModuleStatsResponse> sortModules(List<ModuleStatsResponse> list, Sort sort) {
        if (sort.isUnsorted()) return list; // ordre par défaut (titre) donné par la requête
        Sort.Order o = sort.iterator().next();
        Comparator<ModuleStatsResponse> cmp = switch (o.getProperty()) {
            case "submittedCount"    -> Comparator.comparing(ModuleStatsResponse::submittedCount, Comparator.nullsLast(Comparator.naturalOrder()));
            case "notSubmittedCount" -> Comparator.comparing(ModuleStatsResponse::notSubmittedCount, Comparator.nullsLast(Comparator.naturalOrder()));
            case "averageScore"      -> Comparator.comparing(ModuleStatsResponse::averageScore, Comparator.nullsLast(Comparator.naturalOrder()));
            default                  -> Comparator.comparing(ModuleStatsResponse::moduleTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        };
        return list.stream().sorted(o.isDescending() ? cmp.reversed() : cmp).toList();
    }

    private List<CollaboratorProgressResponse> sortCollaborators(List<CollaboratorProgressResponse> list, Sort sort) {
        if (sort.isUnsorted()) return list; // ordre par défaut (nom) donné par la requête
        Sort.Order o = sort.iterator().next();
        Comparator<CollaboratorProgressResponse> cmp = switch (o.getProperty()) {
            case "submittedPercent" -> Comparator.comparing(CollaboratorProgressResponse::submittedPercent, Comparator.nullsLast(Comparator.naturalOrder()));
            case "averageScore"     -> Comparator.comparing(CollaboratorProgressResponse::averageScore, Comparator.nullsLast(Comparator.naturalOrder()));
            default                 -> Comparator.comparing(CollaboratorProgressResponse::fullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        };
        return list.stream().sorted(o.isDescending() ? cmp.reversed() : cmp).toList();
    }

    // Pagination en mémoire d'une liste déjà triée.
    private <T> PageResponse<T> paginate(List<T> all, Pageable pageable) {
        if (pageable.isUnpaged()) return PageResponse.from(new PageImpl<>(all));
        int total = all.size();
        int from = (int) Math.min(pageable.getOffset(), total);
        int to = Math.min(from + pageable.getPageSize(), total);
        Page<T> page = new PageImpl<>(all.subList(from, to), pageable, total);
        return PageResponse.from(page);
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
                .moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, FeedbackStatus.IN_PROGRESS, null, Pageable.unpaged())
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

    @Transactional(readOnly = true)
    public RatingDistributionResponse getRatingDistribution(FeedbackStatus status, String search) {
        String searchParam = (search == null || search.isBlank()) ? null : "%" + search.trim().toLowerCase() + "%";
        long[] counts = new long[5];
        for (Double s : feedbackRepository.findScoresForDistribution(status, searchParam)) {
            int star = (int) Math.round(s);
            if (star >= 1 && star <= 5) counts[star - 1]++;
        }
        List<Long> list = new ArrayList<>();
        for (long c : counts) list.add(c);
        return new RatingDistributionResponse(list);
    }

    // Agrégats de l'équipe (donut + KPIs) calculés côté serveur sur TOUS les
    // collaborateurs — plus besoin de tout charger côté navigateur (size=1000).
    @Transactional(readOnly = true)
    public CollaboratorsSummaryResponse getCollaboratorsSummary() {
        List<CollaboratorProgressResponse> all = feedbackRepository
                .collaboratorProgress(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED, null, Pageable.unpaged())
                .getContent();

        long total = all.size();
        long done = all.stream().filter(c -> percent(c) == 100).count();
        long none = all.stream().filter(c -> percent(c) == 0).count();
        long inProgress = total - done - none;
        int avgProgress = total == 0 ? 0
                : (int) Math.round(all.stream().mapToLong(this::percent).average().orElse(0));

        return new CollaboratorsSummaryResponse(total, done, inProgress, none, avgProgress);
    }

    // % de feedbacks soumis d'un collaborateur (déjà calculé par la requête), null -> 0.
    private long percent(CollaboratorProgressResponse c) {
        return c.submittedPercent() == null ? 0 : c.submittedPercent();
    }
}