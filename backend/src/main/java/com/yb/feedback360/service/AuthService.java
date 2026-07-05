package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(JwtDecoder jwtDecoder, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtDecoder = jwtDecoder;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void activate(String token, String rawPassword) {
        Jwt jwt = jwtDecoder.decode(token); // throws if bad or expired signature
        if (!"account:activate" .equals(jwt.getClaimAsString("scope"))) {
            throw new IllegalArgumentException("Wrong token scope");
        }
        Long userId = Long.valueOf(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(rawPassword)); // store the hash
        userRepository.save(user);
    }

}
