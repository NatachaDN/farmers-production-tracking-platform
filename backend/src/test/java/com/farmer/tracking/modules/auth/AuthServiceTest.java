package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.email.EmailService;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.ForgotPasswordRequest;
import com.farmer.tracking.modules.auth.dto.ForgotPasswordResponse;
import com.farmer.tracking.modules.auth.dto.LoginRequest;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
import com.farmer.tracking.modules.auth.dto.ResetPasswordRequest;
import com.farmer.tracking.modules.auth.dto.ResetPasswordResponse;
import com.farmer.tracking.modules.auth.dto.UpdateProfileRequest;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.service.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private EmailService emailService;

    private AuthMapper authMapper;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authMapper = new AuthMapper();
        authService = new AuthServiceImpl(farmerRepository, authMapper, passwordEncoder, tokenProvider, emailService);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Joyce Muthoni");
        request.setEmailOrPhone("joyce@example.com");
        request.setLocation("Nakuru County");
        request.setFarmType(FarmType.MIXED);
        request.setPassword("SecurePass123");

        Farmer savedFarmer = new Farmer();
        savedFarmer.setId(1L);
        savedFarmer.setFullName("Joyce Muthoni");
        savedFarmer.setEmailOrPhone("joyce@example.com");
        savedFarmer.setLocation("Nakuru County");
        savedFarmer.setFarmType(FarmType.MIXED);
        savedFarmer.setPasswordHash("hashed_password");

        when(farmerRepository.existsByEmailOrPhone("joyce@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123")).thenReturn("hashed_password");
        when(farmerRepository.save(any(Farmer.class))).thenReturn(savedFarmer);
        when(tokenProvider.generateToken(1L, "joyce@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("Joyce Muthoni", response.getFarmer().getFullName());
        assertEquals("joyce@example.com", response.getFarmer().getEmailOrPhone());
        verify(farmerRepository, times(1)).save(any(Farmer.class));
    }

    @Test
    void register_ThrowsConflict_WhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Joyce Muthoni");
        request.setEmailOrPhone("joyce@example.com");
        request.setPassword("SecurePass123");

        when(farmerRepository.existsByEmailOrPhone("joyce@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void login_Success_WhenCredentialsValid() {
        LoginRequest request = new LoginRequest("joyce@example.com", "SecurePass123");

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setFullName("Joyce Muthoni");
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordHash("hashed_password");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.matches("SecurePass123", "hashed_password")).thenReturn(true);
        when(tokenProvider.generateToken(1L, "joyce@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("joyce@example.com", response.getFarmer().getEmailOrPhone());
    }

    @Test
    void login_ThrowsUnauthorized_WhenPasswordInvalid() {
        LoginRequest request = new LoginRequest("joyce@example.com", "WrongPassword");

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordHash("hashed_password");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
        verify(tokenProvider, never()).generateToken(any(), anyString());
    }

    @Test
    void updateProfile_Success() {
        Farmer existingFarmer = new Farmer();
        existingFarmer.setId(1L);
        existingFarmer.setFullName("Joyce Muthoni");
        existingFarmer.setEmailOrPhone("joyce@example.com");
        existingFarmer.setLocation("Nakuru");
        existingFarmer.setFarmType(FarmType.MIXED);
        existingFarmer.setFarmName("Old Farm");
        existingFarmer.setCropsGrown("Maize");
        existingFarmer.setTotalArea(5.0);
        existingFarmer.setAvatarUrl("https://example.com/old.jpg");

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Joyce M. Updated");
        request.setFarmName("Green Acres Farm");
        request.setCropsGrown("Maize, Tomatoes, Beans");
        request.setTotalArea(8.7);
        request.setAvatarUrl("https://example.com/new-avatar.jpg");
        request.setLocation("Nakuru County, Kenya");
        request.setFarmType(FarmType.CROP);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(existingFarmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FarmerProfileResponse response = authService.updateProfile("joyce@example.com", request);

        assertNotNull(response);
        assertEquals("Joyce M. Updated", response.getFullName());
        assertEquals("Green Acres Farm", response.getFarmName());
        assertEquals("Maize, Tomatoes, Beans", response.getCropsGrown());
        assertEquals(8.7, response.getTotalArea());
        assertEquals("https://example.com/new-avatar.jpg", response.getAvatarUrl());
        assertEquals("Nakuru County, Kenya", response.getLocation());
        assertEquals(FarmType.CROP, response.getFarmType());
        verify(farmerRepository, times(1)).save(existingFarmer);
    }

    @Test
    void updateProfile_ThrowsIllegalArgumentException_WhenNegativeArea() {
        Farmer existingFarmer = new Farmer();
        existingFarmer.setId(1L);
        existingFarmer.setEmailOrPhone("joyce@example.com");

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setTotalArea(-3.5);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(existingFarmer));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.updateProfile("joyce@example.com", request));

        assertTrue(ex.getMessage().contains("negative"));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void updateProfile_ThrowsResourceNotFound_WhenFarmerNotFound() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFarmName("New Farm");

        when(farmerRepository.findByEmailOrPhone("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                authService.updateProfile("unknown@example.com", request));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void updateProfile_ThrowsUnauthorized_WhenEmailBlank() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        assertThrows(UnauthorizedException.class, () ->
                authService.updateProfile("   ", request));
    }

    @Test
    void forgotPassword_Success() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ForgotPasswordRequest req = new ForgotPasswordRequest("joyce@example.com");

        // EmailService should be called but not return anything
        doNothing().when(emailService).sendPasswordResetCode(anyString(), anyString());

        ForgotPasswordResponse response = authService.forgotPassword(req);

        assertNotNull(response);
        assertEquals("joyce@example.com", response.getEmailOrPhone());
        assertNotNull(response.getMessage());
        assertNotNull(farmer.getPasswordResetToken());
        assertEquals(6, farmer.getPasswordResetToken().length());
        assertNotNull(farmer.getPasswordResetExpiresAt());
        verify(farmerRepository, times(1)).save(farmer);
        verify(emailService, times(1)).sendPasswordResetCode(eq("joyce@example.com"), anyString());
    }

    @Test
    void forgotPassword_ThrowsResourceNotFound_WhenFarmerNotFound() {
        when(farmerRepository.findByEmailOrPhone("unknown@example.com")).thenReturn(Optional.empty());

        ForgotPasswordRequest req = new ForgotPasswordRequest("unknown@example.com");
        assertThrows(ResourceNotFoundException.class, () -> authService.forgotPassword(req));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void forgotPassword_ThrowsIllegalArgument_WhenEmailBlank() {
        ForgotPasswordRequest req = new ForgotPasswordRequest("   ");
        assertThrows(IllegalArgumentException.class, () -> authService.forgotPassword(req));
    }

    @Test
    void resetPassword_Success() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordResetToken("123456");
        farmer.setPasswordResetExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));
        farmer.setPasswordHash("old_hash");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.encode("NewSecret123")).thenReturn("new_encoded_hash");
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResetPasswordRequest req = new ResetPasswordRequest("joyce@example.com", "123456", "NewSecret123");
        ResetPasswordResponse response = authService.resetPassword(req);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("successfully"));
        assertEquals("new_encoded_hash", farmer.getPasswordHash());
        assertNull(farmer.getPasswordResetToken());
        assertNull(farmer.getPasswordResetExpiresAt());
        verify(farmerRepository, times(1)).save(farmer);
    }

    @Test
    void resetPassword_ThrowsUnauthorized_WhenCodeMismatch() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordResetToken("123456");
        farmer.setPasswordResetExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));

        ResetPasswordRequest req = new ResetPasswordRequest("joyce@example.com", "999999", "NewSecret123");
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.resetPassword(req));
        assertTrue(ex.getMessage().contains("Invalid reset code"));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void resetPassword_ThrowsUnauthorized_WhenCodeExpired() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordResetToken("123456");
        farmer.setPasswordResetExpiresAt(java.time.LocalDateTime.now().minusMinutes(5));

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));

        ResetPasswordRequest req = new ResetPasswordRequest("joyce@example.com", "123456", "NewSecret123");
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.resetPassword(req));
        assertTrue(ex.getMessage().contains("expired"));
        verify(farmerRepository, never()).save(any(Farmer.class));
    }

    @Test
    void resetPassword_ThrowsIllegalArgument_WhenPasswordTooShort() {
        ResetPasswordRequest req = new ResetPasswordRequest("joyce@example.com", "123456", "short");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(req));
    }
}
