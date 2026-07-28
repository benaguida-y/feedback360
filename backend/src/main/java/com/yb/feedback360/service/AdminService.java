package com.yb.feedback360.service;

import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.model.Role;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.request.CreateUserRequest;
import com.yb.feedback360.dto.response.AdminStatsResponse;
import com.yb.feedback360.dto.response.AdminUserResponse;
import com.yb.feedback360.dto.response.CreatedUserResponse;
import com.yb.feedback360.dto.response.IntegrationLogResponse;
import com.yb.feedback360.repository.IntegrationLogRepository;
import com.yb.feedback360.repository.RoleRepository;
import com.yb.feedback360.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MagicLinkService magicLinkService;
    private final IntegrationLogRepository integrationLogRepository;

    @Transactional
    public CreatedUserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email already in use");
        }
        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new IllegalStateException("Unknown role" + request.role()));

        User user = new User();
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setRole(role);
        // internal user : no externalUserId, no password yet (set via activation link)
        User saved = userRepository.save(user);

        String activationLink = magicLinkService.createActivationUrl(saved);
        emailService.sendActivationEmail(saved, activationLink);

        return new CreatedUserResponse(saved.getUserId(),
                saved.getEmail(), role.getName(), activationLink);
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByUserIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse setUserActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    private AdminUserResponse toResponse(User u) {
        String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                (u.getLastName() != null ? u.getLastName() : "")).trim();
        if (fullName.isBlank()) {
            fullName = u.getEmail();
        }
        return new AdminUserResponse(
                u.getUserId(), u.getEmail(), fullName,
                u.getRole().getName(), u.isActive(), u.getPasswordHash() != null);
    }

    @Transactional(readOnly = true)
    public List<IntegrationLogResponse> getIntegrationLogs() {
        return integrationLogRepository.findTop100ByOrderByReceivedAtDesc().stream()
                .map(l -> new IntegrationLogResponse(
                        l.getLogId(), l.getType().name(), l.getStatus().name(),
                        l.getReceivedAt(), l.getProcessedAt(),
                        l.getUser() != null ? l.getUser().getEmail() : null,
                        l.getModuleFormation() != null ? l.getModuleFormation().getTitle() : null))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long total = userRepository.count();
        long admins = userRepository.countByRole_Name("ADMIN");
        long managers = userRepository.countByRole_Name("MANAGER");
        long collaborators = userRepository.countByRole_Name("COLLABORATOR");
        long active = userRepository.countByActive(true);
        long inactive = userRepository.countByActive(false);
        long pending = userRepository.countByPasswordHashIsNull();

        long calls = integrationLogRepository.count();
        long success = integrationLogRepository.countByStatus(LogStatus.SUCCESS);
        long failure = integrationLogRepository.countByStatus(LogStatus.FAILURE);

        return new AdminStatsResponse(total, admins, managers, collaborators,
                active, inactive, pending, calls, success, failure);
    }

}
