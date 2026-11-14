package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.email.EmailService;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.PasswordChangeRequest;
import com.farmer.tracking.modules.auth.model.PasswordChangeRequestStatus;
import com.farmer.tracking.modules.auth.model.PasswordResetToken;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.repository.PasswordChangeRequestRepository;
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
    private final PasswordChangeRequestRepository passwordChangeRequestRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            FarmerRepository farmerRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordChangeRequestRepository passwordChangeRequestRepository,
            AuthMapper authMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            EmailService emailService) {
        this.farmerRepository = farmerRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordChangeRequestRepository = passwordChangeRequestRepository;
        this.authMapper = authMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
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

        if (farmer.getStatus() == com.farmer.tracking.modules.auth.model.RegistrationStatus.REJECTED) {
            String explanation = (farmer.getRejectionReason() != null && !farmer.getRejectionReason().isBlank())
                    ? "Your registration was rejected: " + farmer.getRejectionReason()
                    : "Your farmer registration has been rejected by the platform manager. Please contact support.";
            throw new UnauthorizedException(explanation);
        }

        if (farmer.getStatus() == com.farmer.tracking.modules.auth.model.RegistrationStatus.SUSPENDED) {
            String explanation = (farmer.getRejectionReason() != null && !farmer.getRejectionReason().isBlank())
                    ? "Your account has been suspended: " + farmer.getRejectionReason()
                    : "Your account has been suspended by an administrator. Please contact support.";
            throw new UnauthorizedException(explanation);
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
    public FarmerProfileResponse updateProfile(String emailOrPhone, UpdateProfileRequest request) {
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new UnauthorizedException("Authentication required.");
        }

        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        if (request != null) {
            if (request.getFullName() != null) {
                farmer.setFullName(request.getFullName().trim());
            }
            if (request.getFarmName() != null) {
                farmer.setFarmName(request.getFarmName().trim());
            }
            if (request.getCropsGrown() != null) {
                farmer.setCropsGrown(request.getCropsGrown().trim());
            }
            if (request.getTotalArea() != null) {
                if (request.getTotalArea() < 0) {
                    throw new IllegalArgumentException("Total area cannot be negative");
                }
                farmer.setTotalArea(request.getTotalArea());
            }
            if (request.getAvatarUrl() != null) {
                farmer.setAvatarUrl(request.getAvatarUrl().trim());
            }
            if (request.getLocation() != null) {
                farmer.setLocation(request.getLocation().trim());
            }
            if (request.getFarmType() != null) {
                farmer.setFarmType(request.getFarmType());
            }
        }

        Farmer savedFarmer = farmerRepository.save(farmer);
        return authMapper.toProfileResponse(savedFarmer);
    }

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.getEmailOrPhone() == null || request.getEmailOrPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Email or phone number is required.");
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();
        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email or phone number."));

        String resetCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        // Store reset code directly on Farmer entity
        farmer.setPasswordResetToken(resetCode);
        farmer.setPasswordResetExpiresAt(expiresAt);
        farmerRepository.save(farmer);

        // Also track in PasswordResetToken table if repository available
        if (passwordResetTokenRepository != null) {
            List<PasswordResetToken> existing = passwordResetTokenRepository.findByFarmerAndUsedFalse(farmer);
            for (PasswordResetToken t : existing) {
                t.setUsed(true);
            }
            passwordResetTokenRepository.saveAll(existing);
            passwordResetTokenRepository.save(new PasswordResetToken(farmer, resetCode, expiresAt));
        }

        // Send by email if configured
        if (emailService != null) {
            try {
                emailService.sendPasswordResetCode(normalizedIdentifier, resetCode);
            } catch (Exception ex) {
                log.warn("Could not email reset code to [{}]: {}", normalizedIdentifier, ex.getMessage());
            }
        }

        log.info("Password reset code generated for farmer [{}] (valid for 15 minutes)", normalizedIdentifier);

        return new ForgotPasswordResponse(
                "A 6-digit password reset code has been sent to " + normalizedIdentifier + ". Check your inbox.",
                normalizedIdentifier,
                resetCode
        );
    }

    @Override
    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        if (request == null || request.getEmailOrPhone() == null || request.getEmailOrPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Email or phone number is required.");
        }
        if (request.getResetCode() == null || request.getResetCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Reset code is required.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be between 8 and 72 characters.");
        }
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();
        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email or phone number."));

        String resetCode = request.getResetCode().trim();
        boolean validCode = farmer.getPasswordResetToken() != null && farmer.getPasswordResetToken().trim().equals(resetCode);

        // Fallback check against PasswordResetToken table
        PasswordResetToken dbToken = null;
        if (!validCode && passwordResetTokenRepository != null) {
            dbToken = passwordResetTokenRepository.findByFarmerAndTokenAndUsedFalse(farmer, resetCode).orElse(null);
            if (dbToken != null) {
                validCode = true;
            }
        }

        if (!validCode) {
            throw new BadRequestException("Invalid reset code. Please check the code or request a new one.");
        }

        LocalDateTime expiresAt = farmer.getPasswordResetExpiresAt();
        if (expiresAt == null && dbToken != null) {
            expiresAt = dbToken.getExpiresAt();
        }

        if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset code has expired. Please request a new one.");
        }

        farmer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        farmer.setPasswordResetToken(null);
        farmer.setPasswordResetExpiresAt(null);
        farmerRepository.save(farmer);

        if (dbToken != null) {
            dbToken.setUsed(true);
            passwordResetTokenRepository.save(dbToken);
        } else if (passwordResetTokenRepository != null) {
            passwordResetTokenRepository.findByFarmerAndTokenAndUsedFalse(farmer, resetCode)
                    .ifPresent(t -> {
                        t.setUsed(true);
                        passwordResetTokenRepository.save(t);
                    });
        }

        log.info("Password successfully reset for farmer [{}]", normalizedIdentifier);

        return new ResetPasswordResponse("Password has been reset successfully. You can now log in with your new password.");
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

    @Override
    @Transactional
    public PasswordChangeRequestResponse requestPasswordChange(String emailOrPhone, ChangePasswordRequest request) {
        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        if ("GOOGLE".equalsIgnoreCase(farmer.getAuthProvider())) {
            throw new BadRequestException("Accounts signed in with Google manage their password through Google.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), farmer.getPasswordHash())) {
            throw new BadRequestException("Your current password is incorrect.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), farmer.getPasswordHash())) {
            throw new BadRequestException("New password must be different from your current password.");
        }

        if (passwordChangeRequestRepository.existsByFarmerIdAndStatus(farmer.getId(), PasswordChangeRequestStatus.PENDING)) {
            throw new ConflictException("You already have a pending password change request awaiting administrator review.");
        }

        PasswordChangeRequest entity = new PasswordChangeRequest();
        entity.setFarmer(farmer);
        entity.setNewPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        entity.setReason(request.getReason() != null && !request.getReason().isBlank() ? request.getReason().trim() : null);
        entity.setStatus(PasswordChangeRequestStatus.PENDING);

        PasswordChangeRequest saved = passwordChangeRequestRepository.save(entity);
        return PasswordChangeRequestResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PasswordChangeRequestResponse> getMyPasswordChangeRequests(String emailOrPhone) {
        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        return passwordChangeRequestRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId())
                .stream()
                .map(PasswordChangeRequestResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public PasswordChangeRequestResponse cancelPasswordChangeRequest(String emailOrPhone, Long requestId) {
        Farmer farmer = farmerRepository.findByEmailOrPhone(emailOrPhone.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found."));

        PasswordChangeRequest entity = passwordChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Password change request not found."));

        if (!entity.getFarmer().getId().equals(farmer.getId())) {
            throw new UnauthorizedException("You can only cancel your own password change requests.");
        }

        if (entity.getStatus() != PasswordChangeRequestStatus.PENDING) {
            throw new BadRequestException("Only pending password change requests can be cancelled.");
        }

        entity.setStatus(PasswordChangeRequestStatus.CANCELLED);
        entity.setReviewedAt(LocalDateTime.now());
        PasswordChangeRequest saved = passwordChangeRequestRepository.save(entity);
        return PasswordChangeRequestResponse.from(saved);
    }
}
