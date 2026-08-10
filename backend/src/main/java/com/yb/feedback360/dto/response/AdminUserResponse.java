package com.yb.feedback360.dto.response;

// Vue admin d'un utilisateur. `activated` = a défini son mot de passe (lien magique utilisé).
public record AdminUserResponse(
        Long userId,
        String email,
        String fullName,
        String role,
        boolean active,
        boolean activated
) {}