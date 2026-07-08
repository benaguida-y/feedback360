package com.yb.feedback360.repository;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.ModuleFormation;
import com.yb.feedback360.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByUserAndModuleFormationAndStatus(
            User user, ModuleFormation moduleFormation, FeedbackStatus status
    );
    List<Feedback> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}
