package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.dto.request.CreateUserRequest;
import com.yb.feedback360.dto.request.UpdateUserStatusRequest;
import com.yb.feedback360.dto.response.AdminUserResponse;
import com.yb.feedback360.dto.response.CreatedUserResponse;
import com.yb.feedback360.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.ADMIN)
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping(ApiPaths.ADMIN_USERS)
    public ResponseEntity<CreatedUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @GetMapping(ApiPaths.ADMIN_USERS)
    public List<AdminUserResponse> listUsers() {
        return adminService.listUsers();
    }

    @PatchMapping(ApiPaths.ADMIN_USER_STATUS)
    public AdminUserResponse setStatus(@PathVariable Long userId,
                                       @Valid @RequestBody UpdateUserStatusRequest request) {
        return adminService.setUserActive(userId, request.active());
    }

}
