package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.ReminderSettings;
import com.yb.feedback360.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Relance automatique : chaque jour à 08:00, renvoie l'e-mail d'invitation aux feedbacks
 * non soumis dont le dernier contact dépasse le délai réglé, dans la limite du nombre max.
 */
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final ReminderSettingsService settingsService;
    private final FeedbackRepository feedbackRepository;
    private final ReminderService reminderService;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendDueReminders() {
        ReminderSettings settings = settingsService.get();
        if (!settings.isAutoEnabled()) return;

        Instant cutoff = Instant.now().minus(Duration.ofDays(settings.getDelayDays()));
        List<Feedback> due = feedbackRepository.findDueForReminder(
                FeedbackStatus.SUBMITTED, settings.getMaxReminders(), cutoff);

        int sent = 0;
        for (Feedback feedback : due) {
            try {
                reminderService.sendReminder(feedback); // transaction indépendante par feedback
                sent++;
            } catch (RuntimeException e) {
                log.warn("Relance auto échouée pour le feedback {} : {}", feedback.getFeedbackId(), e.getMessage());
            }
        }
        if (sent > 0) log.info("Relance auto : {} e-mail(s) renvoyé(s).", sent);
    }
}
