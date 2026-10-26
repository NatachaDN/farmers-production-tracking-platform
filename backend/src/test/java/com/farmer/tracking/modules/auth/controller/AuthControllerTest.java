package com.farmer.tracking.modules.auth.controller;

import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.GlobalExceptionHandler;
import com.farmer.tracking.common.security.CustomUserDetailsService;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.UpdateProfileRequest;
import com.farmer.tracking.modules.auth.model.FarmType;
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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        UserPrincipal principal = new UserPrincipal(1L, "joyce@example.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_FARMER")));
        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("PUT /api/v1/auth/me updates profile and returns 200 OK")
    void updateProfile_Success() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Joyce Muthoni");
        request.setFarmName("Green Acres Farm");
        request.setCropsGrown("Maize, Tomatoes, Beans");
        request.setTotalArea(8.7);
        request.setAvatarUrl("https://images.unsplash.com/photo-farmer.jpg");
        request.setLocation("Nakuru County, Kenya");
        request.setFarmType(FarmType.MIXED);

        FarmerProfileResponse response = new FarmerProfileResponse();
        response.setId(1L);
        response.setFullName("Joyce Muthoni");
        response.setEmailOrPhone("joyce@example.com");
        response.setFarmName("Green Acres Farm");
        response.setCropsGrown("Maize, Tomatoes, Beans");
        response.setTotalArea(8.7);
        response.setAvatarUrl("https://images.unsplash.com/photo-farmer.jpg");
        response.setLocation("Nakuru County, Kenya");
        response.setFarmType(FarmType.MIXED);

        when(authService.updateProfile(eq("joyce@example.com"), any(UpdateProfileRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Joyce Muthoni"))
                .andExpect(jsonPath("$.farmName").value("Green Acres Farm"))
                .andExpect(jsonPath("$.cropsGrown").value("Maize, Tomatoes, Beans"))
                .andExpect(jsonPath("$.totalArea").value(8.7))
                .andExpect(jsonPath("$.avatarUrl").value("https://images.unsplash.com/photo-farmer.jpg"))
                .andExpect(jsonPath("$.location").value("Nakuru County, Kenya"))
                .andExpect(jsonPath("$.farmType").value("MIXED"));
    }

    @Test
    @DisplayName("PUT /api/v1/auth/me with negative area returns 400 Bad Request with validation error")
    void updateProfile_ValidationError_WhenNegativeArea() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setTotalArea(-2.5);

        mockMvc.perform(put("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.totalArea").value("Total area cannot be negative"));
    }

    @Test
    @DisplayName("PUT /api/v1/auth/me without authentication returns 401 Unauthorized")
    void updateProfile_Unauthorized_WhenNoAuth() throws Exception {
        SecurityContextHolder.clearContext();
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFarmName("Green Acres Farm");

        mockMvc.perform(put("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me returns currently authenticated profile")
    void getCurrentUser_Success() throws Exception {
        FarmerProfileResponse response = new FarmerProfileResponse();
        response.setId(1L);
        response.setFullName("Joyce Muthoni");
        response.setEmailOrPhone("joyce@example.com");
        response.setFarmName("Green Acres Farm");
        response.setTotalArea(8.7);

        when(authService.getCurrentFarmer("joyce@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Joyce Muthoni"))
                .andExpect(jsonPath("$.farmName").value("Green Acres Farm"))
                .andExpect(jsonPath("$.totalArea").value(8.7));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me without authentication returns 401 Unauthorized")
    void getCurrentUser_Unauthorized_WhenNoAuth() throws Exception {
        SecurityContextHolder.clearContext();
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
