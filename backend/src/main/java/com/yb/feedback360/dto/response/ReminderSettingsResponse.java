package com.yb.feedback360.dto.response;

import com.yb.feedback360.domain.model.ReminderSettings;

public record ReminderSettingsResponse(boolean autoEnabled, int delayDays, int maxReminders) {
    public static ReminderSettingsResponse from(ReminderSettings s) {
        return new ReminderSettingsResponse(s.isAutoEnabled(), s.getDelayDays(), s.getMaxReminders());
    }
}
