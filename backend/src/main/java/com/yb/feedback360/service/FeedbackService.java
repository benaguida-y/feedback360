package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.FeedbackAnswer;
import com.yb.feedback360.dto.request.FeedbackSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.repository.FeedbackAnswerRepository;
import com.yb.feedback360.repository.FeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackAnswerRepository feedbackAnswerRepository;

    public List<FeedbackSummaryResponse> getFeedbackForUser(Long userId) {
        return feedbackRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> new FeedbackSummaryResponse(
                        f.getFeedbackId(),
                        f.getStatus().name(),
                        f.getModuleFormation().getTitle(),
                        f.getCreatedAt(),
                        f.getGlobalScore()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public FeedbackDetailResponse getFeedback(Long userId, Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        if (!feedback.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This feedback is not yours");
        }
        List<String> answers = feedbackAnswerRepository
                .findByFeedback_FeedbackId(feedbackId).stream()
                .map(FeedbackAnswer::getValue)
                .toList();
        return new FeedbackDetailResponse(
                feedback.getFeedbackId(),
                feedback.getStatus().name(),
                feedback.getModuleFormation().getTitle(),
                feedback.getCreatedAt(),
                feedback.getGlobalScore(),
                feedback.getComment(),
                answers);
    }
}
