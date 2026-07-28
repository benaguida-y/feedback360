package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.enums.LogType;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.IntegrationLog;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import com.yb.feedback360.dto.response.ModuleCompletionResult;
import com.yb.feedback360.repository.IntegrationLogRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleCompletionFacade {

    private final Validator validator;
    private final ModuleCompletionService moduleCompletionService;
    private final MagicLinkService magicLinkService;
    private final EmailService emailService;
    private final IntegrationLogRepository integrationLogRepository;

    public List<ModuleCompletionResult> process(List<ModuleCompletedRequest> requests) {
        return requests.stream()
                .map(this::processRequest)
                .toList();
    }

    private ModuleCompletionResult processRequest(ModuleCompletedRequest request) {
        String email = request.user() != null ? request.user().email() : null;

        // On trace chaque appel reçu du webhook (supervision).
        IntegrationLog log = new IntegrationLog();
        log.setType(LogType.MODULE_SYNC);
        log.setReceivedAt(Instant.now());
        log.setRequestPayload(String.valueOf(request));

        Set<ConstraintViolation<ModuleCompletedRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String error = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .sorted()
                    .collect(Collectors.joining("; "));
            saveLog(log, LogStatus.FAILURE, null);
            return ModuleCompletionResult.failure(email, error);
        }

        try {
            Feedback feedback = moduleCompletionService.handleModuleCompleted(request);
            String activationLink = magicLinkService.createActivationUrl(feedback.getUser());
            emailService.sendActivationEmail(feedback.getUser(), activationLink);
            saveLog(log, LogStatus.SUCCESS, feedback);
            return ModuleCompletionResult.success(
                    email, feedback.getFeedbackId(), feedback.getStatus().name(), activationLink);
        } catch (Exception e) {
            String error = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            saveLog(log, LogStatus.FAILURE, null);
            return ModuleCompletionResult.failure(email, error);
        }
    }

    // Finalise et enregistre le log (le feedback est null en cas d'échec).
    private void saveLog(IntegrationLog log, LogStatus status, Feedback feedback) {
        log.setStatus(status);
        log.setProcessedAt(Instant.now());
        if (feedback != null) {
            log.setUser(feedback.getUser());
            log.setModuleFormation(feedback.getModuleFormation());
        }
        integrationLogRepository.save(log);
    }
}