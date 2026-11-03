package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.email.EmailService;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.*;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
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
        authService = new AuthServiceImpl(
                farmerRepository,
                authMapper,
                passwordEncoder,
                tokenProvider,
                emailService
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
    void updateProfile_Success() {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setFullName("Old Name");
        farmer.setEmailOrPhone("joyce@example.com");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("New Name");
        req.setFarmName("Sunrise Farm");
        req.setCropsGrown("Maize, Beans");
        req.setTotalArea(12.5);

        FarmerProfileResponse response = authService.updateProfile("joyce@example.com", req);

        assertNotNull(response);
        assertEquals("New Name", farmer.getFullName());
        assertEquals("Sunrise Farm", farmer.getFarmName());
        assertEquals("Maize, Beans", farmer.getCropsGrown());
        assertEquals(12.5, farmer.getTotalArea());
    }

    @Test
    void forgotPassword_StoresHashedCode_AndNeverReturnsIt() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("joyce@example.com");

        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_code");

        ForgotPasswordResponse response = authService.forgotPassword(request);

        assertNotNull(response);
        assertFalse(response.getMessage().matches(".*\\d{6}.*"), "Response must not contain the code");
        assertEquals("hashed_code", farmer.getPasswordResetToken());
        assertEquals(0, farmer.getPasswordResetAttempts());
        verify(emailService).sendPasswordResetCode(eq("joyce@example.com"), argThat(code -> code.matches("\\d{6}")));
        verify(farmerRepository, times(1)).save(farmer);
    }

    @Test
    void forgotPassword_ReturnsGenericResponse_WhenFarmerDoesNotExist() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@example.com");

        when(farmerRepository.findByEmailOrPhone("unknown@example.com")).thenReturn(Optional.empty());

        ForgotPasswordResponse response = authService.forgotPassword(request);

        assertNotNull(response.getMessage());
        verify(emailService, never()).sendPasswordResetCode(anyString(), anyString());
        verify(farmerRepository, never()).save(any());
    }

    private Farmer farmerWithResetCode(LocalDateTime expiresAt, int attempts) {
        Farmer farmer = new Farmer();
        farmer.setId(1L);
        farmer.setEmailOrPhone("joyce@example.com");
        farmer.setPasswordResetToken("hashed_code");
        farmer.setPasswordResetExpiresAt(expiresAt);
        farmer.setPasswordResetAttempts(attempts);
        farmer.setPasswordHash("old_hash");
        return farmer;
    }

    @Test
    void resetPassword_Success_WhenCodeIsValid() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "123456", "NewSecretPass999", "NewSecretPass999"
        );
        Farmer farmer = farmerWithResetCode(LocalDateTime.now().plusMinutes(10), 0);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.matches("123456", "hashed_code")).thenReturn(true);
        when(passwordEncoder.encode("NewSecretPass999")).thenReturn("new_hash");

        ResetPasswordResponse response = authService.resetPassword(request);

        assertNotNull(response);
        assertEquals("new_hash", farmer.getPasswordHash());
        assertNull(farmer.getPasswordResetToken());
        assertNull(farmer.getPasswordResetExpiresAt());
        verify(farmerRepository, times(1)).save(farmer);
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
        Farmer farmer = farmerWithResetCode(LocalDateTime.now().minusMinutes(5), 0);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        assertNull(farmer.getPasswordResetToken());
        assertEquals("old_hash", farmer.getPasswordHash());
    }

    @Test
    void resetPassword_WrongCode_IncrementsAttempts() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "000000", "NewSecretPass999", "NewSecretPass999"
        );
        Farmer farmer = farmerWithResetCode(LocalDateTime.now().plusMinutes(10), 1);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.matches("000000", "hashed_code")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        assertEquals(2, farmer.getPasswordResetAttempts());
        assertEquals("hashed_code", farmer.getPasswordResetToken());
        assertEquals("old_hash", farmer.getPasswordHash());
    }

    @Test
    void resetPassword_FifthWrongCode_InvalidatesCode() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "joyce@example.com", "000000", "NewSecretPass999", "NewSecretPass999"
        );
        Farmer farmer = farmerWithResetCode(LocalDateTime.now().plusMinutes(10), 4);

        when(farmerRepository.findByEmailOrPhone("joyce@example.com")).thenReturn(Optional.of(farmer));
        when(passwordEncoder.matches("000000", "hashed_code")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        assertTrue(ex.getMessage().contains("Too many"));
        assertNull(farmer.getPasswordResetToken());
    }

    @Test
    void resetPassword_UnknownAccount_ReturnsSameErrorAsWrongCode() {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "ghost@example.com", "123456", "NewSecretPass999", "NewSecretPass999"
        );
        when(farmerRepository.findByEmailOrPhone("ghost@example.com")).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        assertTrue(ex.getMessage().startsWith("Invalid reset code"));
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
