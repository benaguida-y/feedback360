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

    private static final String ACTIVATION_SCOPE = "account:activate"; // what the token allows
    private static final String ACTIVATION_PATH = "/activate";

    private final JwtEncoder jwtEncoder;
    private final MagicLinkProperties properties;

    public String createActivationUrl(User user) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getUserId().toString()) // the user who is activating
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(Duration.ofDays(properties.ttlDays())))
                .claim("scope", ACTIVATION_SCOPE)
                .build();
        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(),
                        claims
                )
        ).getTokenValue();
        return "%s%s?token=%s".formatted(properties.baseUrl(), ACTIVATION_PATH, token);
    }
}
