package com.farmer.tracking.modules.notification.controller;

import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.notification.dto.NotificationDtos.*;
import com.farmer.tracking.modules.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Platform notifications for farmers, managers, and administrators")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get notifications for the signed-in user")
    public ResponseEntity<List<NotificationResponse>> myNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required.");
        String role = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse(AdminAccessPolicy.ROLE_FARMER);
        return ResponseEntity.ok(notificationService.getForUser(principal.getId(), role));
    }

    @GetMapping("/sent")
    @Operation(summary = "List all sent notifications (admin or manager)")
    public ResponseEntity<List<NotificationResponse>> allSent(@AuthenticationPrincipal UserPrincipal principal) {
        requireAdminOrManager(principal);
        return ResponseEntity.ok(notificationService.getAllSent());
    }

    @PostMapping("/send")
    @Operation(summary = "Send a notification to a specific user, role, or all users")
    public ResponseEntity<NotificationResponse> send(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendNotificationRequest request) {
        requireAdminOrManager(principal);
        return ResponseEntity.ok(notificationService.send(principal.getId(), principal.getUsername(), request));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications for the signed-in user as read")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required.");
        String role = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse(AdminAccessPolicy.ROLE_FARMER);
        notificationService.markAllRead(principal.getId(), role);
        return ResponseEntity.noContent().build();
    }

    private void requireAdminOrManager(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required.");
        boolean allowed = principal.getAuthorities().stream()
                .anyMatch(a -> AdminAccessPolicy.ROLE_ADMIN.equals(a.getAuthority())
                        || AdminAccessPolicy.ROLE_MANAGER.equals(a.getAuthority()));
        if (!allowed) {
            throw new UnauthorizedException("Administrator or manager role required.");
        }
    }
}

