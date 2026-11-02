package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.PasswordResetToken;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.repository.PasswordResetTokenRepository;
import com.farmer.tracking.modules.auth.service.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
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
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthMapper authMapper;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authMapper = new AuthMapper();
        authService = new AuthServiceImpl(
                farmerRepository,
                passwordResetTokenRepository,
                authMapper,
                passwordEncoder,
                tokenProvider
        );
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
    void forgotPassword_Success_WhenFarmerExists() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("joyce@example.com");

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordResetTokenRepository.findByFarmerAndUsedFalse(farmer)).thenReturn(Collections.emptyList());

        ForgotPasswordResponse response = authService.forgotPassword(request);

        assertNotNull(response);
        assertNotNull(response.getResetCode());
        assertEquals(6, response.getResetCode().length());
        verify(passwordResetTokenRepository, times(1)).save(any(PasswordResetToken.class));
    }

    @Test
    void forgotPassword_ThrowsNotFound_WhenFarmerDoesNotExist() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@example.com");

        when(farmerRepository.findByEmailOrPhone("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.forgotPassword(request));
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void resetPassword_Success_WhenCodeIsValid() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "NewSecretPass999", "NewSecretPass999"
        );

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordHash("old_hash");

        PasswordResetToken token = new PasswordResetToken(farmer, "123456", LocalDateTime.now().plusMinutes(10));

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordResetTokenRepository.findByFarmerAndTokenAndUsedFalse(farmer, "123456"))
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewSecretPass999")).thenReturn("new_hash");

        ResetPasswordResponse response = authService.resetPassword(request);

        assertNotNull(response);
        assertEquals("new_hash", farmer.getPasswordHash());
        assertTrue(token.isUsed());
        verify(farmerRepository, times(1)).save(farmer);
        verify(passwordResetTokenRepository, times(1)).save(token);
    }

    @Test
    void resetPassword_ThrowsBadRequest_WhenPasswordsDoNotMatch() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "NewSecretPass999", "DifferentPass123"
        );

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        verify(farmerRepository, never()).save(any());
    }

    @Test
    void resetPassword_ThrowsBadRequest_WhenCodeExpired() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "NewSecretPass999", "NewSecretPass999"
        );

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");

        PasswordResetToken expiredToken = new PasswordResetToken(farmer, "123456", LocalDateTime.now().minusMinutes(5));

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordResetTokenRepository.findByFarmerAndTokenAndUsedFalse(farmer, "123456"))
                .thenReturn(Optional.of(expiredToken));

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
    }

    @Test
    void uploadAvatar_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "fake image content".getBytes()
        );

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FarmerProfileResponse response = authService.uploadAvatar("joyce@example.com", file);

        assertNotNull(response);
        assertNotNull(response.getAvatarUrl());
        assertTrue(response.getAvatarUrl().startsWith("/api/v1/auth/avatars/farmer-1-"));
    }

    @Test
    void uploadAvatar_ThrowsBadRequest_WhenEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);
        assertThrows(BadRequestException.class, () -> authService.uploadAvatar("joyce@example.com", emptyFile));
    }

    @Test
    void uploadAvatar_ThrowsBadRequest_WhenNonImageFile() {
        MockMultipartFile badFile = new MockMultipartFile(
                "file", "script.exe", "application/octet-stream", "content".getBytes()
        );
        assertThrows(BadRequestException.class, () -> authService.uploadAvatar("joyce@example.com", badFile));
    }
}
