package com.yb.feedback360.service;

import com.yb.feedback360.config.MailProperties;
import com.yb.feedback360.domain.model.User;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String LOGO_CID = "logo";
    private static final String LOGO_PATH = "mail/cap_logo.png";

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

    private String buildBody(User user, String activationLink) {
        String name = user.getFirstName() != null ? user.getFirstName() : "";
        // Indexed specifiers (%1$s ...) so the image tag can sit anywhere in the
        // template without the arguments getting misaligned:
        //   %1$s = logo cid, %2$s = first name, %3$s = activation link
        return """
                <div style="font-family: Arial, sans-serif; color: #2b2b2b; max-width: 480px;">
                  <h2 style="margin: 0 0 12px;">Welcome to Feedback360</h2>
                  <p>Hello %2$s,</p>
                  <p>An account has been created for you. Click below to set your password and activate your account:</p>
                  <p style="margin: 24px 0;">
                    <a href="%3$s" style="background:#0070ad;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Activate my account</a>
                  </p>
                  <p style="font-size:12px;color:#777;">If the button doesn't work, copy this link:<br>%3$s</p>
                  <p style="font-size:12px;color:#777;">If you weren't expecting this, you can ignore this email.</p>
                  <img src="cid:%1$s" alt="Feedback360" style="height: 48px; margin-bottom: 24px;" />                
                </div>
                """.formatted(LOGO_CID, name, activationLink);
    }
}
