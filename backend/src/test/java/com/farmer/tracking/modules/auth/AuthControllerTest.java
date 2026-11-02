package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.controller.AuthController;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.service.AuthService;
import com.farmer.tracking.modules.auth.service.GoogleAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private GoogleAuthService googleAuthService;

    @MockBean
    private AuditService auditService;

    @MockBean
    private com.farmer.tracking.common.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.farmer.tracking.common.security.CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /api/v1/auth/forgot-password - Success 200")
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("joyce@example.com");
        ForgotPasswordResponse response = new ForgotPasswordResponse(
                "A password reset code has been sent to your registered email or phone.",
                "123456"
        );

        when(authService.forgotPassword(any(ForgotPasswordRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("A password reset code has been sent to your registered email or phone."))
                .andExpect(jsonPath("$.resetCode").value("123456"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/forgot-password - Blank identifier returns 400")
    void forgotPassword_BlankIdentifier_Returns400() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/forgot-password - Non-existent farmer returns 404")
    void forgotPassword_NotFound_Returns404() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@example.com");

        when(authService.forgotPassword(any(ForgotPasswordRequest.class)))
                .thenThrow(new ResourceNotFoundException("No farmer account found with this email or phone number."));

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No farmer account found with this email or phone number."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/reset-password - Success 200")
    void resetPassword_Success() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "NewPassword123", "NewPassword123"
        );
        ResetPasswordResponse response = new ResetPasswordResponse("Password has been reset successfully.");

        when(authService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/reset-password - Password < 8 chars returns 400")
    void resetPassword_ShortPassword_Returns400() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "short", "short"
        );

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/me/avatar - Success 200 for authenticated farmer")
    void uploadAvatar_Success() throws Exception {
        UserPrincipal principal = new UserPrincipal(
                1L, "joyce@example.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        MockMultipartFile file = new MockMultipartFile(
                "file", "profile.jpg", "image/jpeg", "image-content".getBytes()
        );

        FarmerProfileResponse profileResponse = new FarmerProfileResponse();
        profileResponse.setId(1L);
        profileResponse.setEmailOrPhone("joyce@example.com");
        profileResponse.setAvatarUrl("/api/v1/auth/avatars/farmer-1-123.jpg");

        when(authService.uploadAvatar(eq("joyce@example.com"), any())).thenReturn(profileResponse);

        mockMvc.perform(multipart("/api/v1/auth/me/avatar").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("/api/v1/auth/avatars/farmer-1-123.jpg"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/avatars/{filename} - Serves file")
    void getAvatar_ServesFile() throws Exception {
        ByteArrayResource resource = new ByteArrayResource("image-bytes".getBytes()) {
            @Override
            public String getFilename() {
                return "test.jpg";
            }
        };

        when(authService.loadAvatar("test.jpg")).thenReturn(resource);

        mockMvc.perform(get("/api/v1/auth/avatars/test.jpg"))
                .andExpect(status().isOk())
                .andExpect(content().bytes("image-bytes".getBytes()));
    }
}
