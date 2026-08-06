package com.yb.feedback360.service;

import com.yb.feedback360.config.MailProperties;
import com.yb.feedback360.domain.model.User;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String LOGO_CID = "logo";
    private static final String LOGO_PATH = "mail/cap_logo.png";

    // Le contenu HTML des e-mails vit dans resources/mail/ ; ce service ne gère que l'envoi.
    private static final String TEMPLATE = "mail/activation-email.html";
    private static final String INTRO_MODULE = "mail/activation-module.html";
    private static final String INTRO_GENERIC = "mail/activation-generic.html";
    private static final String INTRO_NEW_FEEDBACK = "mail/new-feedback.html";
    private static final String STYLES = "mail/email.css";

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    // 1re fois : email d'activation (le collaborateur définit son mot de passe).
    public void sendActivationEmail(User user, String link, String moduleTitle) {
        boolean hasModule = moduleTitle != null && !moduleTitle.isBlank();
        String intro = hasModule
                ? loadTemplate(INTRO_MODULE).replace("{{module}}", moduleTitle)
                : loadTemplate(INTRO_GENERIC);
        String subject = hasModule
                ? "Votre avis sur « " + moduleTitle + " » — Feedback360"
                : "Activez votre compte Feedback360";
        send(user, link, subject, "Bienvenue sur Feedback360", intro, "Activer mon compte");
    }

    // Compte déjà activé : email invitant à donner un nouveau feedback (connexion directe).
    public void sendNewFeedbackEmail(User user, String link, String moduleTitle) {
        String intro = loadTemplate(INTRO_NEW_FEEDBACK).replace("{{module}}", moduleTitle != null ? moduleTitle : "");
        String subject = "Votre avis sur « " + moduleTitle + " » — Feedback360";
        send(user, link, subject, "Un nouveau feedback à donner", intro, "Donner mon feedback");
    }

    // Envoi générique (multipart HTML + logo inline).
    private void send(User user, String link, String subject, String title, String intro, String cta) {
        mailSender.send(mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailProperties.from());
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(buildBody(user, link, title, intro, cta), true); // html = true

            byte[] logo = new ClassPathResource(LOGO_PATH).getContentAsByteArray();
            helper.addInline(LOGO_CID, new ByteArrayDataSource(logo, "image/png"));
        });
    }

    private String buildBody(User user, String link, String title, String intro, String cta) {
        String name = user.getFirstName() != null ? user.getFirstName() : "";
        return loadTemplate(TEMPLATE)
                .replace("{{styles}}", loadTemplate(STYLES))
                .replace("{{title}}", title)
                .replace("{{name}}", name)
                .replace("{{intro}}", intro)
                .replace("{{cta}}", cta)
                .replace("{{link}}", link)
                .replace("{{logoCid}}", LOGO_CID);
    }

    private String loadTemplate(String path) {
        try {
            byte[] bytes = new ClassPathResource(path).getContentAsByteArray();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de charger le template e-mail : " + path, e);
        }
    }
}