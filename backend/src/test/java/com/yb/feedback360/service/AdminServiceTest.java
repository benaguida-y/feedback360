package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.Role;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.response.AdminUserDetailResponse;
import com.yb.feedback360.dto.response.AdminUserResponse;
import com.yb.feedback360.repository.IntegrationLogRepository;
import com.yb.feedback360.repository.RoleRepository;
import com.yb.feedback360.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AdminService — fiche utilisateur (getUser) et changement de statut.
 * Repositories mockés, pas de base : on vérifie le mapping et les gardes.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock EmailService emailService;
    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock MagicLinkService magicLinkService;
    @Mock IntegrationLogRepository integrationLogRepository;

    @InjectMocks
    AdminService service;

    private User manager(Long id) {
        User u = new User();
        u.setUserId(id);
        u.setEmail("ann@x.com");
        u.setFirstName("Ann");
        u.setLastName("Lee");
        u.setDepartment("Data");
        u.setExternalUserId(42L);
        u.setPasswordHash("hash"); // -> activé
        u.setActive(true);
        Role role = new Role();
        role.setName("MANAGER");
        u.setRole(role);
        return u;
    }

    // --- getUser ------------------------------------------------------------

    /** Mappe correctement identité, rôle, statut, département et ID externe. */
    @Test
    void getUser_mapsAllFields() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(manager(5L)));

        AdminUserDetailResponse r = service.getUser(5L);

        assertEquals("Ann Lee", r.fullName());
        assertEquals("ann@x.com", r.email());
        assertEquals("MANAGER", r.role());
        assertTrue(r.active());
        assertTrue(r.activated());        // passwordHash != null
        assertEquals("Data", r.department());
        assertEquals(42L, r.externalUserId());
    }

    /** Utilisateur introuvable -> 404 (EntityNotFoundException). */
    @Test
    void getUser_throwsWhenNotFound() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getUser(9L));
    }

    // --- setUserActive ------------------------------------------------------

    /** Désactivation : le statut est mis à jour et persisté. */
    @Test
    void setUserActive_updatesStatus() {
        User u = manager(5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(u));
        when(userRepository.save(any())).thenAnswer(returnsFirstArg());

        AdminUserResponse r = service.setUserActive(5L, false);

        assertFalse(r.active());
        assertFalse(u.isActive());
    }
}
