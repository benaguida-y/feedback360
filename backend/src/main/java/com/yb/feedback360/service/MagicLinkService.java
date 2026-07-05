package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class MagicLinkService {
    private final JwtEncoder jwtEncoder;
    private final String baseUrl;
    private final Long ttlDays;

    public MagicLinkService(JwtEncoder jwtEncoder,
                            @Value("${feedback360.app.base-url}") String baseUrl,
                            @Value("${feedback360.magic-link.ttl-days}") Long ttlDays) {
        this.jwtEncoder = jwtEncoder;
        this.baseUrl = baseUrl;
        this.ttlDays = ttlDays;
    }

    public String createActivationUrl(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getUserId())) //who is activating
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofDays(ttlDays)))
                .claim("scope", "account:activate") // what token allows
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return baseUrl + "/activate?token=" + token;
    }

}
