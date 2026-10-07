package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.LoginRequest;
import com.farmer.tracking.modules.auth.dto.RegisterRequest;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final FarmerRepository farmerRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(
            FarmerRepository farmerRepository,
            AuthMapper authMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.farmerRepository = farmerRepository;
        this.authMapper = authMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        if (farmerRepository.existsByEmailOrPhone(normalizedIdentifier)) {
            throw new ConflictException("A farmer account already exists with this email or phone number.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Farmer farmer = authMapper.toEntity(request, encodedPassword);
        Farmer savedFarmer = farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(savedFarmer.getId(), savedFarmer.getEmailOrPhone());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(savedFarmer);

        return new AuthResponse(token, profileResponse, "Farmer account registered successfully.");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/phone or password."));

        if (!passwordEncoder.matches(request.getPassword(), farmer.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email/phone or password.");
        }

        String token = tokenProvider.generateToken(farmer.getId(), farmer.getEmailOrPhone());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(farmer);

        return new AuthResponse(token, profileResponse, "Login successful.");
    }

    @Override
    @Transactional(readOnly = true)
    public FarmerProfileResponse getCurrentFarmer(String emailOrPhone) {
        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        return authMapper.toProfileResponse(farmer);
    }
}
