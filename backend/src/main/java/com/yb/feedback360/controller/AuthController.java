package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.dto.request.ActivateRequest;
import com.yb.feedback360.dto.request.LoginRequest;
import com.yb.feedback360.dto.request.MagicLoginRequest;
import com.yb.feedback360.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(ApiPaths.AUTHENTICATION)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(ApiPaths.ACTIVATE)
    public ResponseEntity<Void> activateUser(@Valid @RequestBody ActivateRequest request) {
        authService.activate(request.token(), request.password());
        return ResponseEntity.noContent().build(); // 204
    }

    @PostMapping(ApiPaths.LOGIN)
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.email(), request.password());
        return ResponseEntity.ok(Map.of("accessToken", token, "tokenType", "Bearer"));
    }

    @PostMapping(ApiPaths.MAGIC_LOGIN)
    public ResponseEntity<Map<String, String>> magicLogin(@Valid @RequestBody MagicLoginRequest request) {
        String token = authService.magicLogin(request.token());
        return ResponseEntity.ok(Map.of("accessToken", token, "tokenType", "Bearer"));
    }
}