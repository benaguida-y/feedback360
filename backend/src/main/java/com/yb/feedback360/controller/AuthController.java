package com.yb.feedback360.controller;

import com.yb.feedback360.dto.request.ActivateRequest;
import com.yb.feedback360.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/activate")
    public ResponseEntity<Void> activateUser(@RequestBody ActivateRequest request) {
        authService.activate(request.token(), request.password());
        return ResponseEntity.noContent().build(); // 204
    }
}
