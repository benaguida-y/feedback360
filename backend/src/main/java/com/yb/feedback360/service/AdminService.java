package com.yb.feedback360.service;

import com.yb.feedback360.domain.model.Role;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.request.CreateUserRequest;
import com.yb.feedback360.dto.response.CreatedUserResponse;
import com.yb.feedback360.repository.RoleRepository;
import com.yb.feedback360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MagicLinkService magicLinkService;

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

}
