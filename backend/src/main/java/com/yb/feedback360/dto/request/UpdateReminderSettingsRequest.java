package com.yb.feedback360.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateReminderSettingsRequest(
        boolean autoEnabled,
        @Min(1) @Max(365) int delayDays,
        @Min(1) @Max(10) int maxReminders
) {}
