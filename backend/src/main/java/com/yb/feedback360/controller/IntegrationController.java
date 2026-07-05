package com.yb.feedback360.controller;

import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.service.MagicLinkService;
import com.yb.feedback360.service.ModuleCompletionService;
import com.yb.feedback360.dto.request.ModuleCompletedRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {

    private final ModuleCompletionService moduleCompletionService;
    private final MagicLinkService magicLinkService;
    private final Validator validator;

    public IntegrationController(ModuleCompletionService moduleCompletionService,
                                 MagicLinkService magicLinkService,
                                 Validator validator) {
        this.moduleCompletionService = moduleCompletionService;
        this.magicLinkService = magicLinkService;
        this.validator = validator;
    }

    @PostMapping("/module-completed")
    public ResponseEntity<List<Map<String, Object>>> moduleCompleted(
            @RequestBody List<ModuleCompletedRequest> requests) {
        List<Map<String, Object>> results = new ArrayList<>();

        for (ModuleCompletedRequest request : requests) {
            Map<String, Object> result = new HashMap<>();
            result.put("email", request.user() != null ? request.user().email() : null);

            // validate this event; if it breaks a rule, record a friendly message and skip it
            Set<ConstraintViolation<ModuleCompletedRequest>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                result.put("success", false);
                result.put("error", violations.stream()
                        .map(ConstraintViolation::getMessage)
                        .sorted()
                        .collect(Collectors.joining("; ")));
                results.add(result);
                continue;
            }

            try {
                Feedback feedback = moduleCompletionService.handleModuleCompleted(request);
                String activationLink = magicLinkService.createActivationUrl(feedback.getUser());
                result.put("success", true);
                result.put("feedbackId", feedback.getFeedbackId());
                result.put("status", feedback.getStatus().name());
                result.put("activationLink", activationLink);
            } catch (Exception e) {
                result.put("success", false);
                result.put("error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
            }
            results.add(result);
        }
        return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(results); // 207
    }
}
