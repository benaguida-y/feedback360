package com.yb.feedback360.service;

import com.yb.feedback360.config.MagicLinkProperties;
import com.yb.feedback360.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MagicLinkService {

    private static final String ACTIVATION_SCOPE = "account:activate"; // définir le mot de passe
    private static final String ACTIVATION_PATH = "/activate";
    private static final String LOGIN_PATH = "/login";

    private final JwtEncoder jwtEncoder;
    private final MagicLinkProperties properties;

    // Compte jamais activé, sans feedback ciblé (création manuelle par un admin) :
    // lien vers la page "définir mon mot de passe".
    public String createActivationUrl(User user) {
        return buildActivationUrl(user, null);
    }

    // Compte jamais activé, invité pour un feedback précis : après avoir défini son mot
    // de passe, le collaborateur passe par la connexion puis arrive sur ce feedback.
    public String createActivationUrl(User user, Long feedbackId) {
        return buildActivationUrl(user, feedbackId);
    }

    private String buildActivationUrl(User user, Long feedbackId) {
        String token = signToken(user, ACTIVATION_SCOPE);
        String url = "%s%s?token=%s".formatted(properties.baseUrl(), ACTIVATION_PATH, token);
        return feedbackId == null ? url : "%s&next=/feedback/%d".formatted(url, feedbackId);
    }

    // Compte déjà activé : lien vers la page de connexion, puis redirection vers le
    // feedback à remplir une fois connecté (plus de connexion automatique).
    public String createLoginUrl(User user, Long feedbackId) {
        return "%s%s?next=/feedback/%d".formatted(properties.baseUrl(), LOGIN_PATH, feedbackId);
    }

    private String signToken(User user, String scope) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getUserId().toString())
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(Duration.ofDays(properties.ttlDays())))
                .claim("scope", scope)
                .build();
        return jwtEncoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(),
                        claims
                )
        ).getTokenValue();
    }
}