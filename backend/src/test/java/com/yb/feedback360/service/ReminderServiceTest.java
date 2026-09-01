package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.IntegrationLogRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ReminderService — les gardes de la relance manuelle.
 */
@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock FeedbackRepository feedbackRepository;
    @Mock MagicLinkService magicLinkService;
    @Mock EmailService emailService;
    @Mock IntegrationLogRepository integrationLogRepository;

    @InjectMocks
    ReminderService service;

    /** On ne relance pas un feedback déjà soumis -> 409 (IllegalStateException). */
    @Test
    void remind_throwsWhenAlreadySubmitted() {
        Feedback fb = new Feedback();
        fb.setStatus(FeedbackStatus.SUBMITTED);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(fb));

        assertThrows(IllegalStateException.class, () -> service.remind(1L));
    }

    /** Feedback introuvable -> 404 (EntityNotFoundException). */
    @Test
    void remind_throwsWhenNotFound() {
        when(feedbackRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.remind(9L));
    }
}
