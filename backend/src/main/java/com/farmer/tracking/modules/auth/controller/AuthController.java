package com.farmer.tracking.modules.auth.controller;

import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.ApiException;
import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.GoogleConfigResponse;
import com.farmer.tracking.modules.auth.dto.GoogleLoginRequest;
import com.farmer.tracking.modules.auth.dto.LoginRequest;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
import com.farmer.tracking.modules.auth.service.AuthService;
import com.farmer.tracking.modules.auth.service.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for farmer registration, login (password or Google) and session retrieval")
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
        FarmerProfileResponse profile = authService.getCurrentFarmer(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }
}
