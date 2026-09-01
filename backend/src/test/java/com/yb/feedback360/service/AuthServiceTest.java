package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.Role;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AuthService (login + activate), the security-critical logic.
 *
 * All four collaborators (JwtDecoder, UserRepository, PasswordEncoder, JwtEncoder)
 * are Mockito mocks, so there's no database, no real JWT signing, and no BCrypt work.
 * We drive each branch and assert the outcome (token returned, password hashed, or the
 * right exception thrown).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    JwtDecoder jwtDecoder;
    @Mock
    UserRepository userRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    JwtEncoder jwtEncoder;
    @Mock
    MagicLinkService magicLinkService;
    @Mock
    EmailService emailService;

    @InjectMocks
    AuthService authService;

    // Builds a user with a role (login puts the role name into the JWT claims).
    private User userWithPassword(Long id, String email, String passwordHash) {
        Role role = new Role();
        role.setName("COLLABORATOR");

        User user = new User();
        user.setUserId(id);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setRole(role);
        return user;
    }

    // --- login ---------------------------------------------------------------

    /**
     * Valid email + password -> the service builds a JWT and returns its token value.
     * We fake the encoder so no real signing happens.
     */
    @Test
    void login_returnsToken_whenCredentialsValid() {
        User user = userWithPassword(1L, "a@x.com", "hashed");
        when(userRepository.findByEmail("a@x.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pw", "hashed")).thenReturn(true);

        Jwt jwt = mock(Jwt.class);
        when(jwt.getTokenValue()).thenReturn("jwt-token");
        when(jwtEncoder.encode(any())).thenReturn(jwt);

        String token = authService.login("a@x.com", "pw");

        assertEquals("jwt-token", token);
    }

    /**
     * Unknown email -> BadCredentialsException (which maps to 401).
     */
    @Test
    void login_throwsBadCredentials_whenEmailNotFound() {
        when(userRepository.findByEmail("missing@x.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login("missing@x.com", "pw"));
    }

    /**
     * Wrong password -> BadCredentialsException (401). Note we return the same generic
     * error as "email not found" so we don't leak which one was wrong.
     */
    @Test
    void login_throwsBadCredentials_whenPasswordWrong() {
        User user = userWithPassword(1L, "a@x.com", "hashed");
        when(userRepository.findByEmail("a@x.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login("a@x.com", "wrong"));
    }

    // --- activate ------------------------------------------------------------

    /**
     * Valid activation token -> the chosen password is hashed and stored on the user.
     */
    @Test
    void activate_hashesAndSavesPassword_whenTokenValid() {
        Jwt jwt = mock(Jwt.class);
        when(jwtDecoder.decode("tok")).thenReturn(jwt);
        when(jwt.getClaimAsString("scope")).thenReturn("account:activate"); // correct scope
        when(jwt.getSubject()).thenReturn("1");                              // user id in the token

        User user = userWithPassword(1L, "a@x.com", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass")).thenReturn("hashed-new");

        authService.activate("tok", "newpass");

        assertEquals("hashed-new", user.getPasswordHash()); // stored the HASH, not the raw password
        verify(userRepository).save(user);
    }

    /**
     * A token with the wrong scope (e.g. an access token) must not be usable to set a
     * password -> IllegalArgumentException (400), and nothing is saved.
     */
    @Test
    void activate_throwsIllegalArgument_whenWrongScope() {
        Jwt jwt = mock(Jwt.class);
        when(jwtDecoder.decode("tok")).thenReturn(jwt);
        when(jwt.getClaimAsString("scope")).thenReturn("access"); // wrong scope

        assertThrows(IllegalArgumentException.class, () -> authService.activate("tok", "newpass"));
        verify(userRepository, never()).save(any());
    }

    /**
     * Valid scope but the user id in the token doesn't exist -> IllegalArgumentException (400).
     */
    @Test
    void activate_throwsIllegalArgument_whenUserNotFound() {
        Jwt jwt = mock(Jwt.class);
        when(jwtDecoder.decode("tok")).thenReturn(jwt);
        when(jwt.getClaimAsString("scope")).thenReturn("account:activate");
        when(jwt.getSubject()).thenReturn("99");
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.activate("tok", "newpass"));
        verify(userRepository, never()).save(any());
    }

    // --- reset password ------------------------------------------------------

    /**
     * Jeton de scope "reset" : le nouveau mot de passe est hashe et ECRASE l'ancien
     * (contrairement a l'activation, aucun garde-fou "deja active").
     */
    @Test
    void resetPassword_hashesAndSaves_whenScopeReset() {
        Jwt jwt = mock(Jwt.class);
        when(jwtDecoder.decode("tok")).thenReturn(jwt);
        when(jwt.getClaimAsString("scope")).thenReturn("account:reset");
        when(jwt.getSubject()).thenReturn("1");

        User user = userWithPassword(1L, "a@x.com", "old-hash"); // a deja un mot de passe
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass")).thenReturn("hashed-new");

        authService.resetPassword("tok", "newpass");

        assertEquals("hashed-new", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    /**
     * Un jeton d'activation ne doit pas pouvoir servir a reinitialiser -> 400, rien sauve.
     */
    @Test
    void resetPassword_throwsIllegalArgument_whenWrongScope() {
        Jwt jwt = mock(Jwt.class);
        when(jwtDecoder.decode("tok")).thenReturn(jwt);
        when(jwt.getClaimAsString("scope")).thenReturn("account:activate"); // mauvais scope

        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword("tok", "newpass"));
        verify(userRepository, never()).save(any());
    }

    // --- request password reset (mot de passe oublie) ------------------------

    /** E-mail connu : on genere un lien et on envoie l'e-mail de reinitialisation. */
    @Test
    void requestPasswordReset_sendsEmail_whenUserExists() {
        User user = userWithPassword(1L, "a@x.com", "hash");
        when(userRepository.findByEmail("a@x.com")).thenReturn(Optional.of(user));
        when(magicLinkService.createResetUrl(user)).thenReturn("http://link");

        authService.requestPasswordReset("a@x.com");

        verify(emailService).sendPasswordResetEmail(user, "http://link");
    }

    /** E-mail inconnu : silencieux (anti-enumeration) -> aucun e-mail envoye. */
    @Test
    void requestPasswordReset_silent_whenUserMissing() {
        when(userRepository.findByEmail("missing@x.com")).thenReturn(Optional.empty());

        authService.requestPasswordReset("missing@x.com");

        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }
}
