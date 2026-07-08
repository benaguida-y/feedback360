package com.yb.feedback360.controller;

import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public List<FeedbackSummaryResponse> myFeedbacks(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getFeedbackForUser(userId);
    }

    @GetMapping("/{feedbackId}")
    public FeedbackDetailResponse getOne(@AuthenticationPrincipal Jwt jwt, @PathVariable Long feedbackId) {
        Long userId = Long.valueOf(jwt.getSubject());
        return feedbackService.getFeedback(userId, feedbackId);
    }

}
