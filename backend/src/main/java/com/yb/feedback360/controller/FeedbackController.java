package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.request.DraftFeedbackRequest;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.request.SubmitFeedbackRequest;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.dto.response.PageResponse;
import com.yb.feedback360.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(ApiPaths.FEEDBACKS)
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public PageResponse<FeedbackSummaryResponse> myFeedbacks(@AuthenticationPrincipal Jwt jwt,
                                                             @RequestParam(required = false) FeedbackStatus status,
                                                             @RequestParam(required = false) String search,
                                                             @PageableDefault(size = 10) Pageable pageable) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getFeedbackForUser(userId, status, search, pageable);
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

    @PostMapping(ApiPaths.DRAFT)
    public FeedbackDetailResponse saveDraft(@AuthenticationPrincipal Jwt jwt, @PathVariable Long feedbackId,
                                            @RequestBody DraftFeedbackRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.saveDraft(userId, feedbackId, request);
    }


}
