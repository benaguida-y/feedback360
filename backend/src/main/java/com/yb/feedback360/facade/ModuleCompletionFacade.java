package com.yb.feedback360.facade;

import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import com.yb.feedback360.dto.response.ModuleCompletionResult;
import com.yb.feedback360.service.MagicLinkService;
import com.yb.feedback360.service.ModuleCompletionService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleCompletionFacade {

    private final Validator validator;
    private final ModuleCompletionService moduleCompletionService;
    private final MagicLinkService magicLinkService;

    public List<ModuleCompletionResult> process(List<ModuleCompletedRequest> requests) {
        return requests.stream()
                .map(this::processRequest)
                .toList();
    }

    private ModuleCompletionResult processRequest(ModuleCompletedRequest request) {
        String email = request.user() != null ? request.user().email() : null;

        Set<ConstraintViolation<ModuleCompletedRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String error = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .sorted()
                    .collect(Collectors.joining("; "));
            return ModuleCompletionResult.failure(email, error);
        }

        try {
            Feedback feedback = moduleCompletionService.handleModuleCompleted(request);
            String activationLink = magicLinkService.createActivationUrl(feedback.getUser());
            return ModuleCompletionResult.success(
                    email, feedback.getFeedbackId(), feedback.getStatus().name(), activationLink);
        } catch (Exception e) {
            String error = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ModuleCompletionResult.failure(email, error);
        }
    }
}
