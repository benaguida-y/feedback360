package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.ManagementStatsResponse;
import com.yb.feedback360.dto.response.ModuleStatsResponse;
import com.yb.feedback360.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagementService {
    private final FeedbackRepository feedbackRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getGlobalSummary() {
        long total = feedbackRepository.count();
        long submitted = feedbackRepository.countByStatus(FeedbackStatus.SUBMITTED);
        long notSubmitted = feedbackRepository.countByStatus(FeedbackStatus.NOT_SUBMITTED);
        long inProgress = feedbackRepository.countByStatus(FeedbackStatus.IN_PROGRESS);

        return new DashboardSummaryResponse(total, submitted, notSubmitted, inProgress);
    }

    public List<FeedbackSummaryResponse> getAllFeedbacks(FeedbackStatus status) {
        List<Feedback> feedbacks = (status == null)
                ? feedbackRepository.findAllByOrderByCreatedAtDesc()
                : feedbackRepository.findByStatusOrderByCreatedAtDesc(status);

        return feedbacks.stream()
                .map(FeedbackSummaryResponse::from)
                .toList();
    }

    @Transactional
    public ManagementStatsResponse getStats(){
        long total = feedbackRepository.count();
        long submitted = feedbackRepository.countByStatus(FeedbackStatus.SUBMITTED);

        double submissionRate = 0.0;
        if (total != 0) {
            submissionRate = (double) submitted / total;
        }

        Double averageScore = feedbackRepository.averageScore(FeedbackStatus.SUBMITTED);
        List<ModuleStatsResponse> perModule = feedbackRepository.moduleStats(FeedbackStatus.SUBMITTED, FeedbackStatus.NOT_SUBMITTED);
        return new ManagementStatsResponse(total, submitted, submissionRate, averageScore, perModule);
    }
}
