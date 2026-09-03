package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.ReminderSettings;
import com.yb.feedback360.repository.ReminderSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReminderSettingsService {

    private final ReminderSettingsRepository repository;

    // Ligne unique : créée par la migration, mais recréée par sécurité si absente.
    @Transactional
    public ReminderSettings get() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            ReminderSettings s = new ReminderSettings();
            s.setAutoEnabled(false);
            s.setDelayDays(7);
            s.setMaxReminders(3);
            return repository.save(s);
        });
    }

    @Transactional
    public ReminderSettings update(boolean autoEnabled, int delayDays, int maxReminders) {
        ReminderSettings s = get();
        s.setAutoEnabled(autoEnabled);
        s.setDelayDays(Math.max(1, delayDays));
        s.setMaxReminders(Math.max(1, maxReminders));
        return repository.save(s);
    }
}
