package com.yb.feedback360.dto.request;

import jakarta.validation.constraints.*;

public record SubmitFeedbackRequest(
        @NotNull(message = "globalScore is required")
        @DecimalMin(value = "0.0", message = "globalScore must be >= 0")
        @DecimalMax(value = "5.0", message = "globalScore must be <= 5")
        Double globalScore,

        @Size(max = 2000, message = "comment must be at most 2000 characters")
        String comment

) {
}
