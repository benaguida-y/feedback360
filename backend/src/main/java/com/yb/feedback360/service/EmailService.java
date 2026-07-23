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
    private static final String TEMPLATE_PATH = "mail/activation-email.html";

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    public void sendActivationEmail(User user, String activationLink) {
        mailSender.send(mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8"); // multipart

            helper.setFrom(mailProperties.from());
            helper.setTo(user.getEmail());
            helper.setSubject("Activate your Feedback360 account");
            helper.setText(buildBody(user, activationLink), true); // html = true

            // Attach as a DataSource (no filename) so Gmail renders it inline via cid,
            // instead of treating it as an attachment.
            byte[] logo = new ClassPathResource(LOGO_PATH).getContentAsByteArray();
            helper.addInline(LOGO_CID, new ByteArrayDataSource(logo, "image/png"));
        });
    }

    // Charge le gabarit HTML depuis resources/mail/ et remplace les placeholders {{...}}.
    // Le contenu de l'email vit dans un fichier à part ; ce service ne gère que l'envoi.
    private String buildBody(User user, String activationLink) {
        String name = user.getFirstName() != null ? user.getFirstName() : "";
        return loadTemplate()
                .replace("{{name}}", name)
                .replace("{{link}}", activationLink)
                .replace("{{logoCid}}", LOGO_CID);
    }

    private String loadTemplate() {
        try {
            byte[] bytes = new ClassPathResource(TEMPLATE_PATH).getContentAsByteArray();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot load email template: " + TEMPLATE_PATH, e);
        }
    }
}