package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import com.yb.feedback360.dto.response.ModuleCompletionResult;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.yb.feedback360.repository.IntegrationLogRepository;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ModuleCompletionFacade — the webhook orchestrator.
 *
 * Its job: for each event in the batch, validate it, then (if valid) create the
 * feedback + activation link, and turn the outcome into a per-item
 * ModuleCompletionResult. The important guarantee is that ONE bad event doesn't
 * fail the whole batch. All three collaborators are mocked so we test only that
 * per-item logic (no real validation, no DB, no JWT).
 */
@ExtendWith(MockitoExtension.class)
class ModuleCompletionFacadeTest {
    @Mock
    Validator validator;
    @Mock
    ModuleCompletionService moduleCompletionService;
    @Mock
    MagicLinkService magicLinkService;
    @Mock
    EmailService emailService;
    @Mock
    IntegrationLogRepository integrationLogRepository;

    @InjectMocks
    ModuleCompletionFacade facade;

    // Minimal request carrying just an email (the only field the facade reads directly);
    // the rest is null because the Validator is mocked and doesn't actually inspect it.
    private ModuleCompletedRequest requestForEmail(String email) {
        return new ModuleCompletedRequest(
                new ModuleCompletedRequest.UserPayload(1L, email, "Alice"),
                null, null, null);
    }

    private Feedback savedFeedback() {
        Feedback feedback = new Feedback();
        feedback.setFeedbackId(1L);
        feedback.setUser(new User());
        feedback.setStatus(FeedbackStatus.NOT_SUBMITTED);
        return feedback;
    }

    /**
     * Valid event + service succeeds -> a success result carrying the id, status and link.
     */
    @Test
    void process_returnsSuccess_whenValidAndServiceSucceeds() {
        ModuleCompletedRequest request = requestForEmail("a@x.com");
        when(validator.validate(request)).thenReturn(Set.of());          // no violations
        when(moduleCompletionService.handleModuleCompleted(request)).thenReturn(savedFeedback());
        when(magicLinkService.createActivationUrl(any())).thenReturn("http://link");

        List<ModuleCompletionResult> results = facade.process(List.of(request));

        assertEquals(1, results.size());
        ModuleCompletionResult r = results.get(0);
        assertTrue(r.success());
        assertEquals("a@x.com", r.email());
        assertEquals(1L, r.feedbackId());
        assertEquals("NOT_SUBMITTED", r.status());
        assertEquals("http://link", r.activationLink());
        assertNull(r.error());
    }

    /**
     * A validation violation -> failure result, and the service is never called
     * (we don't try to persist an invalid event).
     */
    @Test
    @SuppressWarnings("unchecked") // mock(ConstraintViolation.class) is a raw type
    void process_returnsFailure_whenValidationFails() {
        ModuleCompletedRequest request = requestForEmail("bad@x.com");
        ConstraintViolation<ModuleCompletedRequest> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("module is required");
        when(validator.validate(request)).thenReturn(Set.of(violation));

        List<ModuleCompletionResult> results = facade.process(List.of(request));

        ModuleCompletionResult r = results.get(0);
        assertFalse(r.success());
        assertEquals("bad@x.com", r.email());
        assertEquals("module is required", r.error());
        verify(moduleCompletionService, never()).handleModuleCompleted(any());
    }

    /**
     * If the service throws, the facade catches it and reports a failure result
     * (rather than letting the whole request blow up).
     */
    @Test
    void process_returnsFailure_whenServiceThrows() {
        ModuleCompletedRequest request = requestForEmail("a@x.com");
        when(validator.validate(request)).thenReturn(Set.of());
        when(moduleCompletionService.handleModuleCompleted(request)).thenThrow(new RuntimeException("boom"));

        ModuleCompletionResult r = facade.process(List.of(request)).get(0);

        assertFalse(r.success());
        assertEquals("boom", r.error());
    }

    /**
     * The key guarantee: in a batch, a bad event fails on its own while the good
     * event still succeeds. Results come back in the same order as the input.
     */
    @Test
    @SuppressWarnings("unchecked")
    void process_isolatesFailures_inABatch() {
        ModuleCompletedRequest good = requestForEmail("good@x.com");
        ModuleCompletedRequest bad = requestForEmail("bad@x.com");

        when(validator.validate(good)).thenReturn(Set.of());
        ConstraintViolation<ModuleCompletedRequest> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("invalid");
        when(validator.validate(bad)).thenReturn(Set.of(violation));

        when(moduleCompletionService.handleModuleCompleted(good)).thenReturn(savedFeedback());
        when(magicLinkService.createActivationUrl(any())).thenReturn("http://link");

        List<ModuleCompletionResult> results = facade.process(List.of(good, bad));

        assertEquals(2, results.size());
        assertTrue(results.get(0).success());   // the good one went through
        assertFalse(results.get(1).success());  // the bad one failed on its own
        assertEquals("invalid", results.get(1).error());
    }
}
