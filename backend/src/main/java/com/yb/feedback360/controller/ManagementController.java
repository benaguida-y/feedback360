package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.response.*;
import com.yb.feedback360.service.ManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.MANAGEMENT)
@RequiredArgsConstructor
public class ManagementController {

    private final ManagementService managementService;

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_SUMMARY)
    public DashboardSummaryResponse globalSummary() {
        return managementService.getGlobalSummary();
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS)
    public PageResponse<ManagementFeedbackSummaryResponse> allFeedbacks(@RequestParam(required = false) FeedbackStatus status,
                                                                        @RequestParam(required = false) String search,
                                                                        @PageableDefault(size = 10) Pageable pageable) {
        return managementService.getAllFeedbacks(status, search, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_STATS)
    public ManagementStatsResponse stats() {
        return managementService.getStats();
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACK_BY_ID)
    public ManagementFeedbackDetailResponse feedbackDetail(@PathVariable Long feedbackId) {
        return managementService.getFeedback(feedbackId);
    }

    @GetMapping(ApiPaths.MANAGEMENT_COLLABORATORS)
    public PageResponse<CollaboratorProgressResponse> collaborators(@RequestParam(required = false) String search,
                                                                    @PageableDefault(size = 10) Pageable pageable) {
        return managementService.getCollaborators(search, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_MODULES)
    public PageResponse<ModuleStatsResponse> modules(@RequestParam(required = false) String search,
                                                     @PageableDefault(size = 10) Pageable pageable) {
        return managementService.getModules(search, pageable);
    }

    @GetMapping(ApiPaths.MANAGEMENT_COLLABORATOR_BY_ID)
    public CollaboratorDetailResponse collaborator(@PathVariable Long userId) {
        return managementService.getCollaborator(userId);
    }

    @GetMapping(ApiPaths.MANAGEMENT_HIGHLIGHTS)
    public DashboardHighlightsResponse highlights() {
        return managementService.getHighlights();
    }
}