package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.dto.request.CreateUserRequest;
import com.yb.feedback360.dto.response.CreatedUserResponse;
import com.yb.feedback360.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.ADMIN)
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping(ApiPaths.ADMIN_USERS)
    public ResponseEntity<CreatedUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

}
