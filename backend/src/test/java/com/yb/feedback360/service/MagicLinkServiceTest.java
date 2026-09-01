package com.yb.feedback360.service;

import com.yb.feedback360.config.MagicLinkProperties;
import com.yb.feedback360.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for MagicLinkService — construction des liens e-mail (activation / connexion).
 *
 * Le JwtEncoder est mocké (pas de vraie signature) et les propriétés sont fournies en dur.
 * On vérifie surtout le FORMAT des URLs, dont l'ajout du paramètre "next" vers le feedback
 * ciblé (comportement modifié : plus de connexion automatique, on passe par /login).
 */
@ExtendWith(MockitoExtension.class)
class MagicLinkServiceTest {

    @Mock
    JwtEncoder jwtEncoder;

    private MagicLinkService service;

    @BeforeEach
    void setUp() {
        service = new MagicLinkService(jwtEncoder, new MagicLinkProperties("http://localhost:5175", 14));
    }

    private User user(Long id) {
        User u = new User();
        u.setUserId(id);
        return u;
    }

    // Fait renvoyer un token connu par le JwtEncoder mocké.
    private void stubToken(String value) {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getTokenValue()).thenReturn(value);
        when(jwtEncoder.encode(any())).thenReturn(jwt);
    }

    // --- activation (nouvel utilisateur) ------------------------------------

    /** Création admin (sans feedback ciblé) : lien vers /activate, sans "next". */
    @Test
    void createActivationUrl_withoutFeedback_hasTokenAndNoNext() {
        stubToken("TOK");
        String url = service.createActivationUrl(user(1L));
        assertEquals("http://localhost:5175/activate?token=TOK", url);
    }

    /** Invitation pour un feedback précis : le lien d'activation porte "next". */
    @Test
    void createActivationUrl_withFeedback_appendsNext() {
        stubToken("TOK");
        String url = service.createActivationUrl(user(1L), 20L);
        assertEquals("http://localhost:5175/activate?token=TOK&next=/feedback/20", url);
    }

    // --- connexion (utilisateur existant) -----------------------------------

    /** Compte déjà activé : lien vers la page /login avec "next", et AUCUN token. */
    @Test
    void createLoginUrl_pointsToLoginPageWithNext_andNoToken() {
        // Pas de token ici -> le JwtEncoder ne doit pas être sollicité.
        String url = service.createLoginUrl(user(1L), 20L);
        assertEquals("http://localhost:5175/login?next=/feedback/20", url);
    }
}
