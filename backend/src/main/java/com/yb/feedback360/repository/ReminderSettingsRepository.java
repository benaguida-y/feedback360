package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.ReminderSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderSettingsRepository extends JpaRepository<ReminderSettings, Long> {
}
