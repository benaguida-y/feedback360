package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.dto.request.DraftFeedbackRequest;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.request.SubmitFeedbackRequest;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.dto.response.PageResponse;
import com.yb.feedback360.repository.FeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional(readOnly = true)
    public PageResponse<FeedbackSummaryResponse> getFeedbackForUser(Long userId, FeedbackStatus status, Integer score, String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank())
                ? null : "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(
                feedbackRepository.findUserFeedbacks(userId, status, score, searchParam, pageable)
                        .map(FeedbackSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public FeedbackDetailResponse getFeedback(Long userId, Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        if (!feedback.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This feedback is not yours");
        }
        return new FeedbackDetailResponse(
                feedback.getFeedbackId(),
                feedback.getStatus().name(),
                feedback.getModuleFormation().getTitle(),
                feedback.getCreatedAt(),
                feedback.getGlobalScore(),
                feedback.getComment()
                );
    }

    @Transactional
    public FeedbackDetailResponse submitFeedback(Long userId, Long feedbackId, SubmitFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        if (!feedback.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This feedback is not yours");
        }
        if (feedback.getStatus() == FeedbackStatus.SUBMITTED) {
            throw new IllegalStateException("Feedback already submitted");
        }
        applySubmission(feedback, request);
        return getFeedback(userId, feedbackId);
    }

    private void applySubmission(Feedback feedback, SubmitFeedbackRequest request) {
        feedback.setGlobalScore(request.globalScore());
        feedback.setComment(request.comment());
        feedback.setStatus(FeedbackStatus.SUBMITTED);
        feedbackRepository.save(feedback);
    }

    // Enregistre un brouillon : conserve la note/commentaire partiels sans finaliser.
    // Le feedback passe en IN_PROGRESS tant qu'il n'est pas soumis.
    @Transactional
    public FeedbackDetailResponse saveDraft(Long userId, Long feedbackId, DraftFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        if (!feedback.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This feedback is not yours");
        }
        if (feedback.getStatus() == FeedbackStatus.SUBMITTED) {
            throw new IllegalStateException("Feedback already submitted");
        }
        feedback.setGlobalScore(request.globalScore());
        feedback.setComment(request.comment());
        feedback.setStatus(FeedbackStatus.IN_PROGRESS);
        feedbackRepository.save(feedback);
        return getFeedback(userId, feedbackId);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long userId){
        Long total = feedbackRepository.countByUser_UserId(userId);
        Long submitted = feedbackRepository.countByUser_UserIdAndStatus(userId, FeedbackStatus.SUBMITTED);
        Long notSubmitted = feedbackRepository.countByUser_UserIdAndStatus(userId, FeedbackStatus.NOT_SUBMITTED);
        Long inProgress = feedbackRepository.countByUser_UserIdAndStatus(userId, FeedbackStatus.IN_PROGRESS);

        return new DashboardSummaryResponse(total, submitted, notSubmitted, inProgress);
    }
}
