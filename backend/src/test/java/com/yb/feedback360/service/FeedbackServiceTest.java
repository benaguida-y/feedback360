package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.ModuleFormation;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.request.SubmitFeedbackRequest;
import com.yb.feedback360.dto.response.DashboardSummaryResponse;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.repository.FeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FeedbackService (submitFeedback, getFeedback, getDashboardSummary).
 *
 * "Unit" test = we test this ONE class in isolation, with no Spring context and no
 * real database. The repository is replaced by a Mockito "mock" (a fake we control),
 * so the tests are fast and deterministic and only exercise the service's own logic:
 * the ownership check, the already-submitted guard, and the state change on success.
 *
 * @ExtendWith(MockitoExtension.class) tells JUnit to let Mockito process the
 * @Mock / @InjectMocks annotations below before each test.
 */
@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    // A fake FeedbackRepository. We decide what it returns per test, so no database is needed.
    @Mock
    FeedbackRepository feedbackRepository;

    // The real service under test. Mockito builds it and injects the @Mock above
    // into its constructor, so feedbackService uses our fake repository.
    @InjectMocks
    FeedbackService feedbackService;

    /**
     * Test helper: builds a NOT_SUBMITTED feedback (id 1) owned by the given user,
     * with the fields getFeedback() reads when building its response (module title,
     * createdAt). Keeps each test short by centralising this setup.
     */
    private Feedback pendingFeedbackOwnedBy(Long ownerId) {
        User user = new User();
        user.setUserId(ownerId);

        ModuleFormation module = new ModuleFormation();
        module.setTitle("Java Basics");

        Feedback feedback = new Feedback();
        feedback.setFeedbackId(1L);
        feedback.setUser(user);
        feedback.setModuleFormation(module);
        feedback.setStatus(FeedbackStatus.NOT_SUBMITTED);
        feedback.setCreatedAt(Instant.now());
        return feedback;
    }

    /**
     * Happy path: a pending feedback, submitted by its owner, should be updated
     * (score + comment saved) and its status flipped to SUBMITTED.
     */
    @Test
    void submit_updatesFeedback_whenPendingAndOwned() {
        // given: the repository will return our pending feedback for id 1
        Feedback feedback = pendingFeedbackOwnedBy(501L);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

        // when: user 501 (the owner) submits it with a score and comment
        FeedbackDetailResponse response =
                feedbackService.submitFeedback(501L, 1L, new SubmitFeedbackRequest(4.5, "Great module"));

        // then: the feedback was mutated as expected...
        assertEquals(FeedbackStatus.SUBMITTED, feedback.getStatus());
        assertEquals(4.5, feedback.getGlobalScore());
        assertEquals("Great module", feedback.getComment());
        // ...the returned response reflects the new status...
        assertEquals("SUBMITTED", response.status());
        // ...and the service actually persisted the change.
        verify(feedbackRepository).save(feedback);
    }

    /**
     * If the feedback id doesn't exist, the service must throw EntityNotFoundException
     * (which the GlobalExceptionHandler turns into a 404) and never save anything.
     */
    @Test
    void submit_throwsNotFound_whenFeedbackMissing() {
        // given: the repository finds nothing for id 99
        when(feedbackRepository.findById(99L)).thenReturn(Optional.empty());

        // when / then: submitting throws, and no save happens
        assertThrows(EntityNotFoundException.class,
                () -> feedbackService.submitFeedback(501L, 99L, new SubmitFeedbackRequest(4.0, "x")));
        verify(feedbackRepository, never()).save(any());
    }

    /**
     * A user must not submit someone else's feedback: the ownership check should
     * throw AccessDeniedException (-> 403) and nothing is saved.
     */
    @Test
    void submit_throwsAccessDenied_whenNotOwner() {
        // given: feedback 1 is owned by user 501
        Feedback feedback = pendingFeedbackOwnedBy(501L);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

        // when / then: a different user (999) is rejected, and no save happens
        assertThrows(AccessDeniedException.class,
                () -> feedbackService.submitFeedback(999L, 1L, new SubmitFeedbackRequest(4.0, "x")));
        verify(feedbackRepository, never()).save(any());
    }

    /**
     * A feedback can only be submitted once: if it's already SUBMITTED, the service
     * throws IllegalStateException (-> 409 Conflict) and does not save again.
     */
    @Test
    void submit_throwsIllegalState_whenAlreadySubmitted() {
        // given: feedback 1 is already submitted
        Feedback feedback = pendingFeedbackOwnedBy(501L);
        feedback.setStatus(FeedbackStatus.SUBMITTED);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

        // when / then: re-submitting is blocked, and no save happens
        assertThrows(IllegalStateException.class,
                () -> feedbackService.submitFeedback(501L, 1L, new SubmitFeedbackRequest(4.0, "x")));
        verify(feedbackRepository, never()).save(any());
    }

    // --- getFeedback (view one feedback) ---------------------------------------

    /**
     * The owner can read their feedback: the service maps the entity into a
     * FeedbackDetailResponse (id, module title, status, ...).
     */
    @Test
    void getFeedback_returnsDetail_whenOwned() {
        // given: feedback 1 belongs to user 501
        Feedback feedback = pendingFeedbackOwnedBy(501L);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

        // when: the owner asks for it
        FeedbackDetailResponse response = feedbackService.getFeedback(501L, 1L);

        // then: the response carries the feedback's data
        assertEquals(1L, response.feedbackId());
        assertEquals("Java Basics", response.moduleTitle());
        assertEquals("NOT_SUBMITTED", response.status());
    }

    /**
     * Reading someone else's feedback is forbidden: AccessDeniedException (-> 403).
     */
    @Test
    void getFeedback_throwsAccessDenied_whenNotOwner() {
        // given: feedback 1 belongs to user 501
        Feedback feedback = pendingFeedbackOwnedBy(501L);
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

        // when / then: a different user (999) is rejected
        assertThrows(AccessDeniedException.class, () -> feedbackService.getFeedback(999L, 1L));
    }

    /**
     * Reading a non-existent feedback throws EntityNotFoundException (-> 404).
     */
    @Test
    void getFeedback_throwsNotFound_whenMissing() {
        // given: nothing found for id 99
        when(feedbackRepository.findById(99L)).thenReturn(Optional.empty());

        // when / then
        assertThrows(EntityNotFoundException.class, () -> feedbackService.getFeedback(501L, 99L));
    }

    // --- getDashboardSummary (per-user counts) ---------------------------------

    /**
     * The dashboard summary just assembles the four repository counts into the
     * response record. We stub each count and assert the record mirrors them.
     */
    @Test
    void dashboardSummary_assemblesCountsPerStatus() {
        // given: the repository reports these counts for user 501
        when(feedbackRepository.countByUser_UserId(501L)).thenReturn(5L);
        when(feedbackRepository.countByUser_UserIdAndStatus(501L, FeedbackStatus.SUBMITTED)).thenReturn(2L);
        when(feedbackRepository.countByUser_UserIdAndStatus(501L, FeedbackStatus.NOT_SUBMITTED)).thenReturn(2L);
        when(feedbackRepository.countByUser_UserIdAndStatus(501L, FeedbackStatus.IN_PROGRESS)).thenReturn(1L);

        // when
        DashboardSummaryResponse summary = feedbackService.getDashboardSummary(501L);

        // then: the record mirrors the counts (total, submitted, notSubmitted, inProgress)
        assertEquals(5L, summary.total());
        assertEquals(2L, summary.submitted());
        assertEquals(2L, summary.notSubmitted());
        assertEquals(1L, summary.inProgress());
    }
}
