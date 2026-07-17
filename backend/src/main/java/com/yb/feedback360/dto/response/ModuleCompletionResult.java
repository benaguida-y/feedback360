package com.yb.feedback360.dto.response;


public record ModuleCompletionResult(
        String email,
        boolean success,
        Long feedbackId,
        String status,
        String activationLink,
        String error
) {
    public static ModuleCompletionResult success(String email, Long feedbackId,
                                                 String status, String activationLink) {
        return new ModuleCompletionResult(email, true, feedbackId, status, activationLink, null);
    }

    public static ModuleCompletionResult failure(String email, String error) {
        return new ModuleCompletionResult(email, false, null, null, null, error);
    }
}
