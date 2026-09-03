package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.enums.LogType;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.IntegrationLog;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.IntegrationLogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Renvoi de l'e-mail d'invitation à donner un feedback non encore soumis (« relance »).
 * Réutilise la même mécanique que le webhook : lien magique (activation ou connexion
 * directe selon l'état du compte) + e-mail, et trace chaque envoi en log REMINDER.
 */
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final FeedbackRepository feedbackRepository;
    private final MagicLinkService magicLinkService;
    private final EmailService emailService;
    private final IntegrationLogRepository integrationLogRepository;

    // Relance manuelle depuis l'interface manager/RH.
    @Transactional
    public void remind(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        if (feedback.getStatus() == FeedbackStatus.SUBMITTED) {
            throw new IllegalStateException("Feedback already submitted");
        }
        sendReminder(feedback);
    }

    // Envoi effectif — réutilisable par une relance automatique planifiée.
    // REQUIRES_NEW : dans le job, un échec sur un feedback n'annule pas les autres.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendReminder(Feedback feedback) {
        User user = feedback.getUser();
        String moduleTitle = feedback.getModuleFormation().getTitle();

        IntegrationLog log = new IntegrationLog();
        log.setType(LogType.REMINDER);
        log.setReceivedAt(Instant.now());
        log.setUser(user);
        log.setModuleFormation(feedback.getModuleFormation());

        try {
            if (user.getPasswordHash() == null) {
                // Jamais activé : rappel au ton « relance » mais lien d'activation (mot de passe).
                String link = magicLinkService.createActivationUrl(user, feedback.getFeedbackId());
                emailService.sendActivationReminderEmail(user, link, moduleTitle);
            } else {
                // Compte activé : rappel avec lien de connexion directe vers le feedback à remplir.
                String link = magicLinkService.createLoginUrl(user, feedback.getFeedbackId());
                emailService.sendReminderEmail(user, link, moduleTitle);
            }
            log.setStatus(LogStatus.SUCCESS);
            feedback.setReminderCount(feedback.getReminderCount() + 1);
            feedback.setLastRemindedAt(Instant.now());
            feedbackRepository.save(feedback);
        } catch (RuntimeException e) {
            log.setStatus(LogStatus.FAILURE);
            log.setErrorMessage(e.getMessage());
            log.setProcessedAt(Instant.now());
            integrationLogRepository.save(log);
            throw e;
        }

        log.setProcessedAt(Instant.now());
        integrationLogRepository.save(log);
    }
}
