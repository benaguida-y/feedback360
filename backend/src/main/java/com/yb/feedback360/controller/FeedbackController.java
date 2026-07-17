package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.request.SubmitFeedbackRequest;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.FEEDBACKS)
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public List<FeedbackSummaryResponse> myFeedbacks(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false)FeedbackStatus status) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getFeedbackForUser(userId, status);
    }

    @GetMapping(ApiPaths.BY_ID)
    public FeedbackDetailResponse getOne(@AuthenticationPrincipal Jwt jwt, @PathVariable Long feedbackId) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getFeedback(userId, feedbackId);
    }

    @PostMapping(ApiPaths.SUBMIT)
    public FeedbackDetailResponse submit(@AuthenticationPrincipal Jwt jwt, @PathVariable Long feedbackId, @Valid @RequestBody SubmitFeedbackRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.submitFeedback(userId, feedbackId, request);
    }

    @GetMapping(ApiPaths.SUMMARY)
    public DashboardSummaryResponse summary(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getDashboardSummary(userId);
    }




}
