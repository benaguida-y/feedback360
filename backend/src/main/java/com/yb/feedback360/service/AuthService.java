package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.DisabledException;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    @Transactional
    public void activate(String token, String rawPassword) {
        Jwt jwt = jwtDecoder.decode(token); // throws if bad or expired signature
        if (!"account:activate".equals(jwt.getClaimAsString("scope"))) {
            throw new IllegalArgumentException("Wrong token scope");
        }
        Long userId = Long.valueOf(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(rawPassword)); // store the hash
        userRepository.save(user);
    }

    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid Credentials!");
        }
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (fullName.isBlank()) {
            fullName = user.getEmail();
        }
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getUserId()))
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofHours(12)))
                .claim("scope", "access")
                .claim("role", user.getRole().getName())
                .claim("name", fullName)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
