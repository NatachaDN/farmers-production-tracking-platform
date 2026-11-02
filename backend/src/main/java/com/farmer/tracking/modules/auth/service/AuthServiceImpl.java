package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.PasswordResetToken;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.repository.PasswordResetTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final FarmerRepository farmerRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            FarmerRepository farmerRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            AuthMapper authMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.farmerRepository = farmerRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
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
        farmer.setLastLoginAt(LocalDateTime.now());
        Farmer savedFarmer = farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(savedFarmer.getId(), savedFarmer.getEmailOrPhone());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(savedFarmer);

        return new AuthResponse(token, profileResponse, "Farmer account registered successfully.");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/phone or password."));

        if (!passwordEncoder.matches(request.getPassword(), farmer.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email/phone or password.");
        }

        farmer.setLastLoginAt(LocalDateTime.now());
        farmerRepository.save(farmer);

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

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("No farmer account found with this email or phone number."));

        // Invalidate prior unused tokens for this farmer
        List<PasswordResetToken> existing = passwordResetTokenRepository.findByFarmerAndUsedFalse(farmer);
        for (PasswordResetToken t : existing) {
            t.setUsed(true);
        }
        passwordResetTokenRepository.saveAll(existing);

        // Generate 6-digit numeric verification code
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = new PasswordResetToken(farmer, code, expiresAt);
        passwordResetTokenRepository.save(resetToken);

        log.info("Generated password reset code for farmer [{}]: {}", farmer.getId(), code);

        return new ForgotPasswordResponse(
                "A password reset code has been sent to your registered email or phone.",
                code
        );
    }

    @Override
    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();
        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("No farmer account found with this email or phone number."));

        String code = request.getResetCode().trim();
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByFarmerAndTokenAndUsedFalse(farmer, code)
                .orElseThrow(() -> new BadRequestException("Invalid or already used reset code."));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset code has expired. Please request a new one.");
        }

        // Apply new hashed password
        farmer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        farmerRepository.save(farmer);

        // Mark token as consumed
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password successfully reset for farmer [{}]", farmer.getId());

        return new ResetPasswordResponse("Password has been reset successfully. You can now sign in with your new password.");
    }

    @Override
    @Transactional
    public FarmerProfileResponse uploadAvatar(String emailOrPhone, MultipartFile file) {
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new UnauthorizedException("Authentication required.");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select an image file to upload.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Image file size must not exceed 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equalsIgnoreCase("image/jpeg")
                && !contentType.equalsIgnoreCase("image/png")
                && !contentType.equalsIgnoreCase("image/webp")
                && !contentType.equalsIgnoreCase("image/gif"))) {
            throw new BadRequestException("Only JPEG, PNG, WEBP, or GIF images are allowed.");
        }

        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        String ext = ".png";
        if (contentType.equalsIgnoreCase("image/jpeg")) {
            ext = ".jpg";
        } else if (contentType.equalsIgnoreCase("image/webp")) {
            ext = ".webp";
        } else if (contentType.equalsIgnoreCase("image/gif")) {
            ext = ".gif";
        }

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "avatars");
            Files.createDirectories(uploadDir);

            String fileName = "farmer-" + farmer.getId() + "-" + System.currentTimeMillis() + ext;
            Path targetPath = uploadDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            farmer.setAvatarUrl("/api/v1/auth/avatars/" + fileName);
            Farmer savedFarmer = farmerRepository.save(farmer);

            return authMapper.toProfileResponse(savedFarmer);
        } catch (IOException e) {
            log.error("Failed to store avatar for farmer [{}]", farmer.getId(), e);
            throw new BadRequestException("Could not upload profile picture: " + e.getMessage());
        }
    }

    @Override
    public Resource loadAvatar(String fileName) {
        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "avatars").normalize();
            Path targetPath = uploadDir.resolve(fileName).normalize();

            if (!targetPath.startsWith(uploadDir)) {
                throw new BadRequestException("Invalid file path.");
            }

            Resource resource = new UrlResource(targetPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Avatar image not found.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new BadRequestException("Invalid file url.");
        }
    }
}
