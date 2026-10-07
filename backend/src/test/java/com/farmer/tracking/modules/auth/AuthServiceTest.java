package com.farmer.tracking.modules.auth;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.LoginRequest;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
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

    private AuthMapper authMapper;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authMapper = new AuthMapper();
        authService = new AuthServiceImpl(farmerRepository, authMapper, passwordEncoder, tokenProvider);
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
}
