package com.farmer.tracking.modules.auth.controller;

import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.ApiException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.service.AuthService;
import com.farmer.tracking.modules.auth.service.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for farmer registration, login, password recovery and profile management")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final AuditService auditService;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService, AuditService auditService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.auditService = auditService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new farmer account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        AuthResponse response = authService.register(request);
        auditService.record(AuditEventType.REGISTER, response.getFarmer().getId(),
                response.getFarmer().getFullName(), "Registered with email or phone", http);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate a farmer and obtain JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        try {
            AuthResponse response = authService.login(request);
            auditService.record(AuditEventType.LOGIN, response.getFarmer().getId(),
                    response.getFarmer().getFullName(), "Signed in with password", http);
            return ResponseEntity.ok(response);
        } catch (ApiException ex) {
            auditService.record(AuditEventType.LOGIN_FAILED, null,
                    request.getEmailOrPhone(), ex.getMessage(), http);
            throw ex;
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset code for a forgotten password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        ForgotPasswordResponse response = authService.forgotPassword(request);
        auditService.record(AuditEventType.PASSWORD_RESET_REQUESTED, null,
                request.getEmailOrPhone(), "Password reset code requested", http);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using verification code and new password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest http) {
        ResetPasswordResponse response = authService.resetPassword(request);
        auditService.record(AuditEventType.PASSWORD_RESET_COMPLETED, null,
                request.getEmailOrPhone(), "Password successfully reset", http);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google/config")
    @Operation(summary = "Public settings needed to start Google sign-in")
    public ResponseEntity<GoogleConfigResponse> googleConfig() {
        return ResponseEntity.ok(googleAuthService.config());
    }

    @PostMapping("/google")
    @Operation(summary = "Sign in (or sign up) with a Google authorization code and obtain JWT token")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest http) {
        try {
            GoogleAuthService.GoogleLoginResult result =
                    googleAuthService.login(request.getCode(), request.getRedirectUri(), request.getCodeVerifier());
            AuthResponse response = result.response();
            auditService.record(
                    result.newAccount() ? AuditEventType.GOOGLE_REGISTER : AuditEventType.GOOGLE_LOGIN,
                    response.getFarmer().getId(),
                    response.getFarmer().getFullName(),
                    result.newAccount() ? "Account created with Google" : "Signed in with Google",
                    http);
            return ResponseEntity.ok(response);
        } catch (ApiException ex) {
            auditService.record(AuditEventType.GOOGLE_LOGIN_FAILED, null, "Google sign-in", ex.getMessage(), http);
            throw ex;
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated farmer profile")
    public ResponseEntity<FarmerProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        FarmerProfileResponse profile = authService.getCurrentFarmer(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping({"/me", "/profile"})
    @Operation(summary = "Update authenticated farmer profile information (farm, crops grown, total area, photo)")
    public ResponseEntity<FarmerProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        FarmerProfileResponse profile = authService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile picture for the currently authenticated farmer")
    public ResponseEntity<FarmerProfileResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        FarmerProfileResponse response = authService.uploadAvatar(userDetails.getUsername(), file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/avatars/{fileName:.+}")
    @Operation(summary = "Serve uploaded farmer avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable String fileName) {
        Resource resource = authService.loadAvatar(fileName);
        String contentType = "image/jpeg";
        try {
            String probed = Files.probeContentType(resource.getFile().toPath());
            if (probed != null) {
                contentType = probed;
            }
        } catch (IOException ignored) {}

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
