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
    private static final String LOGIN_SCOPE = "account:login";         // connexion directe
    private static final String ACTIVATION_PATH = "/activate";
    private static final String LOGIN_PATH = "/magic-login";

    private final JwtEncoder jwtEncoder;
    private final MagicLinkProperties properties;

    // Compte jamais activé : lien vers la page "définir mon mot de passe".
    public String createActivationUrl(User user) {
        String token = signToken(user, ACTIVATION_SCOPE);
        return "%s%s?token=%s".formatted(properties.baseUrl(), ACTIVATION_PATH, token);
    }

    // Compte déjà activé : lien de connexion directe vers le nouveau feedback à remplir.
    public String createLoginUrl(User user, Long feedbackId) {
        String token = signToken(user, LOGIN_SCOPE);
        return "%s%s?token=%s&next=/feedback/%d".formatted(properties.baseUrl(), LOGIN_PATH, token, feedbackId);
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