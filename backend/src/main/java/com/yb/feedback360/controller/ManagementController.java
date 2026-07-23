package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.ManagementStatsResponse;
import com.yb.feedback360.service.ManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
    public List<FeedbackSummaryResponse> allFeedbacks(@RequestParam(required = false) FeedbackStatus status) {
        return managementService.getAllFeedbacks(status);
    }

    @GetMapping(ApiPaths.MANAGEMENT_FEEDBACKS_STATS)
    public ManagementStatsResponse stats() {
        return managementService.getStats();
    }

}
