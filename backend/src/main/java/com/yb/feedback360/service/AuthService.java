package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Garde-fou : un compte déjà activé ne peut pas redéfinir son mot de passe via ce lien.
        if (user.getPasswordHash() != null) {
            throw new IllegalStateException("Compte déjà activé");
        }

        user.setPasswordHash(passwordEncoder.encode(rawPassword)); // store the hash
        userRepository.save(user);
    }

    // Connexion classique email + mot de passe.
    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid Credentials!");
        }
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }
        return issueAccessToken(user);
    }

    // Connexion via lien magique (compte déjà activé) : échange le token contre un JWT de session.
    public String magicLogin(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        if (!"account:login".equals(jwt.getClaimAsString("scope"))) {
            throw new IllegalArgumentException("Wrong token scope");
        }
        Long userId = Long.valueOf(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }
        return issueAccessToken(user);
    }

    // Émission du JWT de session applicative (partagé par login et magicLogin).
    private String issueAccessToken(User user) {
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