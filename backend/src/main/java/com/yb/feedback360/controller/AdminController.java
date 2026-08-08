package com.yb.feedback360.controller;

import com.yb.feedback360.constant.ApiPaths;
import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.enums.LogType;
import com.yb.feedback360.dto.request.CreateUserRequest;
import com.yb.feedback360.dto.request.UpdateReminderSettingsRequest;
import com.yb.feedback360.dto.request.UpdateUserStatusRequest;
import com.yb.feedback360.dto.response.*;
import com.yb.feedback360.service.AdminService;
import com.yb.feedback360.service.ReminderSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.ADMIN)
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final ReminderSettingsService reminderSettingsService;

    @PostMapping(ApiPaths.ADMIN_USERS)
    public ResponseEntity<CreatedUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @GetMapping(ApiPaths.ADMIN_USERS)
    public PageResponse<AdminUserResponse> listUsers(@RequestParam(required = false) String role,
                                                     @RequestParam(required = false) String status,
                                                     @RequestParam(required = false) String search,
                                                     @PageableDefault(size = 10, sort = "userId") Pageable pageable) {
        return adminService.listUsers(role, status, search, pageable);
    }

    @GetMapping(ApiPaths.ADMIN_STATS_USERS)
    public AdminUserStatsResponse userStats() {
        return adminService.getUserStats();
    }

    @GetMapping(ApiPaths.ADMIN_STATS_INTEGRATIONS)
    public AdminIntegrationStatsResponse integrationStats() {
        return adminService.getIntegrationStats();
    }

    @PatchMapping(ApiPaths.ADMIN_USER_STATUS)
    public AdminUserResponse setStatus(@PathVariable Long userId,
                                       @Valid @RequestBody UpdateUserStatusRequest request) {
        return adminService.setUserActive(userId, request.active());
    }

    @GetMapping(ApiPaths.ADMIN_REMINDER_SETTINGS)
    public ReminderSettingsResponse reminderSettings() {
        return ReminderSettingsResponse.from(reminderSettingsService.get());
    }

    @PutMapping(ApiPaths.ADMIN_REMINDER_SETTINGS)
    public ReminderSettingsResponse updateReminderSettings(@Valid @RequestBody UpdateReminderSettingsRequest request) {
        return ReminderSettingsResponse.from(
                reminderSettingsService.update(request.autoEnabled(), request.delayDays(), request.maxReminders()));
    }

    @GetMapping(ApiPaths.ADMIN_LOGS)
    public PageResponse<IntegrationLogResponse> logs(@RequestParam(required = false) LogType type,
                                                     @RequestParam(required = false) LogStatus status,
                                                     @RequestParam(required = false) String search,
                                                     @PageableDefault(size = 10, sort = "receivedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return adminService.getIntegrationLogs(type, status, search, pageable);
    }



}
