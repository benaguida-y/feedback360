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

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    // moduleTitle est null pour un compte créé par l'admin (aucun module lié).
    public void sendActivationEmail(User user, String activationLink, String moduleTitle) {
        boolean hasModule = moduleTitle != null && !moduleTitle.isBlank();
        mailSender.send(mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8"); // multipart

            helper.setFrom(mailProperties.from());
            helper.setTo(user.getEmail());
            helper.setSubject(hasModule
                    ? "Votre avis sur « " + moduleTitle + " » — Feedback360"
                    : "Activez votre compte Feedback360");
            helper.setText(buildBody(user, activationLink, moduleTitle), true); // html = true

            // Attach as a DataSource (no filename) so Gmail renders it inline via cid.
            byte[] logo = new ClassPathResource(LOGO_PATH).getContentAsByteArray();
            helper.addInline(LOGO_CID, new ByteArrayDataSource(logo, "image/png"));
        });
    }

    private String buildBody(User user, String activationLink, String moduleTitle) {
        String name = user.getFirstName() != null ? user.getFirstName() : "";
        boolean hasModule = moduleTitle != null && !moduleTitle.isBlank();

        String intro = hasModule
                ? loadTemplate(INTRO_MODULE).replace("{{module}}", moduleTitle)
                : loadTemplate(INTRO_GENERIC);

        return loadTemplate(TEMPLATE)
                .replace("{{name}}", name)
                .replace("{{intro}}", intro)
                .replace("{{link}}", activationLink)
                .replace("{{logoCid}}", LOGO_CID);
    }

    // Charge un template depuis le classpath (resources/) en UTF-8.
    private String loadTemplate(String path) {
        try {
            byte[] bytes = new ClassPathResource(path).getContentAsByteArray();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de charger le template e-mail : " + path, e);
        }
    }
}