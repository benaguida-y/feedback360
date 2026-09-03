package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.response.*;
import com.yb.feedback360.service.ManagementService;
import com.yb.feedback360.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.MANAGEMENT)
@RequiredArgsConstructor
public class ManagementController {

    private final ManagementService managementService;
    private final ReminderService reminderService;

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_SUMMARY)
    public DashboardSummaryResponse globalSummary() {
        return managementService.getGlobalSummary();
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS)
    public PageResponse<ManagementFeedbackSummaryResponse> allFeedbacks(@RequestParam(required = false) FeedbackStatus status,
                                                                        @RequestParam(required = false) Integer score,
                                                                        @RequestParam(required = false) String search,
                                                                        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return managementService.getAllFeedbacks(status, score, search, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_STATS)
    public ManagementStatsResponse stats() {
        return managementService.getStats();
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACK_BY_ID)
    public ManagementFeedbackDetailResponse feedbackDetail(@PathVariable Long feedbackId) {
        return managementService.getFeedback(feedbackId);
    }

    // Relance manuelle : renvoie l'e-mail d'invitation pour un feedback non soumis.
    @PostMapping(ApiPaths.MANAGEMENT_FEEDBACK_REMIND)
    public void remind(@PathVariable Long feedbackId) {
        reminderService.remind(feedbackId);
    }

    @GetMapping(ApiPaths.MANAGEMENT_COLLABORATORS)
    public PageResponse<CollaboratorProgressResponse> collaborators(@RequestParam(required = false) String search,
                                                                    @RequestParam(required = false) Integer score,
                                                                    @PageableDefault(size = 10) Pageable pageable) {
        return managementService.getCollaborators(search, score, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_COLLABORATORS_SUMMARY)
    public CollaboratorsSummaryResponse collaboratorsSummary() {
        return managementService.getCollaboratorsSummary();
    }

    @GetMapping(ApiPaths.MANAGEMENT_MODULES)
    public PageResponse<ModuleStatsResponse> modules(@RequestParam(required = false) String search,
                                                     @RequestParam(required = false) Integer score,
                                                     @PageableDefault(size = 10) Pageable pageable) {
        return managementService.getModules(search, score, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_COLLABORATOR_BY_ID)
    public CollaboratorDetailResponse collaborator(@PathVariable Long userId) {
        return managementService.getCollaborator(userId);
    }

    @GetMapping(ApiPaths.MANAGEMENT_HIGHLIGHTS)
    public DashboardHighlightsResponse highlights() {
        return managementService.getHighlights();
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_RATING)
    public RatingDistributionResponse ratingDistribution(@RequestParam(required = false) FeedbackStatus status,
                                                         @RequestParam(required = false) String search) {
        return managementService.getRatingDistribution(status, search);
    }
}