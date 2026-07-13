package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.FeedbackAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackAnswerRepository extends JpaRepository<FeedbackAnswer, Long> {
    List<FeedbackAnswer> findByFeedback_FeedbackId(Long feedbackId);
}
