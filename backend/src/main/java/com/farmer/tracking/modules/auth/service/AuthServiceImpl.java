package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.email.EmailService;
import com.farmer.tracking.common.exception.AccountLockedException;
import com.farmer.tracking.common.exception.ApiException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.common.security.AccountRules;
import com.farmer.tracking.modules.auth.dto.*;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.PasswordChangeRequest;
import com.farmer.tracking.modules.auth.model.PasswordChangeRequestStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.auth.repository.PasswordChangeRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
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

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;
    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid email/phone or password.";
    private static final int RESET_CODE_VALIDITY_MINUTES = 15;
    private static final int MAX_RESET_ATTEMPTS = 5;
    private static final String INVALID_RESET_CODE_MESSAGE =
            "Invalid reset code. Please check the code or request a new one.";

    private final FarmerRepository farmerRepository;
    private final PasswordChangeRequestRepository passwordChangeRequestRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();
    @org.springframework.beans.factory.annotation.Value("${app.registration.review-required:true}")
    private boolean reviewRequired;

    public AuthServiceImpl(
            FarmerRepository farmerRepository,
            PasswordChangeRequestRepository passwordChangeRequestRepository,
            AuthMapper authMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            EmailService emailService) {
        this.farmerRepository = farmerRepository;
        this.passwordChangeRequestRepository = passwordChangeRequestRepository;
        this.authMapper = authMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        AccountRules.identifier(request.getEmailOrPhone());
        AccountRules.password(request.getPassword());
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        if (farmerRepository.existsByEmailOrPhone(normalizedIdentifier)) {
            throw new ConflictException("A farmer account already exists with this email or phone number.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Farmer farmer = authMapper.toEntity(request, encodedPassword);
        if (reviewRequired) {
            farmer.setAccessStatus(Farmer.AccessStatus.PENDING);
            return new AuthResponse(null, authMapper.toProfileResponse(farmerRepository.save(farmer)),
                    "Registration submitted. You can sign in after your account is approved.");
        }
        farmer.setLastLoginAt(LocalDateTime.now());
        Farmer savedFarmer = farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(savedFarmer.getId(), savedFarmer.getEmailOrPhone(), savedFarmer.getTokenVersion());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(savedFarmer);

        return new AuthResponse(token, profileResponse, "Farmer account registered successfully.");
    }

    @Override
    // Failed-attempt counters must be persisted even though the request ends with an error.
    @Transactional(noRollbackFor = {UnauthorizedException.class, AccountLockedException.class})
    public AuthResponse login(LoginRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        Farmer farmer = farmerRepository.findLockedByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));
        if ("GOOGLE".equals(farmer.getAuthProvider())) {
            throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (farmer.getLockedUntil() != null && farmer.getLockedUntil().isAfter(now)) {
            throw new AccountLockedException(lockedMessage(farmer.getLockedUntil(), now));
        }
        if (farmer.getStatus() == com.farmer.tracking.modules.auth.model.RegistrationStatus.REJECTED) {
            String explanation = (farmer.getRejectionReason() != null && !farmer.getRejectionReason().isBlank())
                    ? "Your registration was rejected: " + farmer.getRejectionReason()
                    : "Your farmer registration has been rejected by the platform manager. Please contact support.";
            throw new UnauthorizedException(explanation);
        }

        if (!passwordEncoder.matches(request.getPassword(), farmer.getPasswordHash())) {
            int attempts = farmer.getFailedLoginAttempts() + 1;
            if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                farmer.setFailedLoginAttempts(0);
                farmer.setLockedUntil(now.plusMinutes(LOCK_DURATION_MINUTES));
                farmerRepository.save(farmer);
                log.warn("Farmer [{}] locked for {} minutes after {} failed login attempts",
                        farmer.getId(), LOCK_DURATION_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS);
                throw new AccountLockedException(lockedMessage(farmer.getLockedUntil(), now));
            }
            farmer.setFailedLoginAttempts(attempts);
            farmerRepository.save(farmer);
            throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
        }

        requireActiveAccess(farmer);
        farmer.setFailedLoginAttempts(0);
        farmer.setLockedUntil(null);
        farmer.setLastLoginAt(now);
        farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(farmer.getId(), farmer.getEmailOrPhone(), farmer.getTokenVersion());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(farmer);

        return new AuthResponse(token, profileResponse, "Login successful.");
    }

    static void requireActiveAccess(Farmer farmer) {
        switch (farmer.getAccessStatus()) {
            case ACTIVE -> { }
            case PENDING -> throw new com.farmer.tracking.common.exception.ForbiddenException("Your registration is awaiting approval.");
            case REJECTED -> throw new com.farmer.tracking.common.exception.ForbiddenException("Your registration was declined. Contact the farm administrator.");
            case DISABLED -> throw new com.farmer.tracking.common.exception.ForbiddenException("This account is disabled. Contact the farm administrator.");
        }
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

        Farmer farmer = farmerRepository.findLockedByEmailOrPhone(emailOrPhone.trim().toLowerCase())
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
                if (!Double.isFinite(request.getTotalArea()) || request.getTotalArea() < 0) {
                    throw new IllegalArgumentException("Total area must be finite and cannot be negative");
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
        if (!emailService.isConfigured()) {
            throw new ApiException("Password reset email is currently unavailable. Contact your administrator.", HttpStatus.SERVICE_UNAVAILABLE);
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        // Same response whether or not the account exists, so this endpoint
        // cannot be used to discover which emails/phones are registered.
        ForgotPasswordResponse genericResponse = new ForgotPasswordResponse(
                "If an eligible account exists, check your email for a 6-digit reset code. The code is valid for "
                        + RESET_CODE_VALIDITY_MINUTES + " minutes.",
                normalizedIdentifier
        );

        Farmer farmer = farmerRepository.findLockedByEmailOrPhone(normalizedIdentifier).orElse(null);
        if (farmer == null || !normalizedIdentifier.contains("@") || farmer.getAccessStatus() != Farmer.AccessStatus.ACTIVE
                || "GOOGLE".equals(farmer.getAuthProvider())) {
            return genericResponse;
        }

        String resetCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        try {
            emailService.sendPasswordResetCode(normalizedIdentifier, resetCode);
        } catch (MailException ex) {
            log.warn("SMTP rejected password reset delivery: {}", ex.getClass().getSimpleName());
            return genericResponse;
        }

        // Only a hash of the code is stored; the code itself is sent by email and never returned.
        farmer.setPasswordResetToken(passwordEncoder.encode(resetCode));
        farmer.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(RESET_CODE_VALIDITY_MINUTES));
        farmer.setPasswordResetAttempts(0);
        farmerRepository.save(farmer);

        return genericResponse;
    }

    @Override
    // Failed attempts must be persisted even though the request ends with an error.
    @Transactional(noRollbackFor = BadRequestException.class)
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
        AccountRules.password(request.getNewPassword());
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();
        Farmer farmer = farmerRepository.findLockedByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new BadRequestException(INVALID_RESET_CODE_MESSAGE));

        if (farmer.getPasswordResetToken() == null || farmer.getPasswordResetExpiresAt() == null
                || "GOOGLE".equals(farmer.getAuthProvider()) || farmer.getAccessStatus() != Farmer.AccessStatus.ACTIVE) {
            throw new BadRequestException(INVALID_RESET_CODE_MESSAGE);
        }

        if (farmer.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            clearResetCode(farmer);
            throw new BadRequestException("Password reset code has expired. Please request a new one.");
        }

        if (!passwordEncoder.matches(request.getResetCode().trim(), farmer.getPasswordResetToken())) {
            int attempts = farmer.getPasswordResetAttempts() + 1;
            if (attempts >= MAX_RESET_ATTEMPTS) {
                clearResetCode(farmer);
                throw new BadRequestException("Too many incorrect attempts. Please request a new reset code.");
            }
            farmer.setPasswordResetAttempts(attempts);
            farmerRepository.save(farmer);
            throw new BadRequestException(INVALID_RESET_CODE_MESSAGE);
        }

        farmer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        farmer.setTokenVersion(farmer.getTokenVersion() + 1);
        // Proving ownership by email also lifts a temporary login lock.
        farmer.setFailedLoginAttempts(0);
        farmer.setLockedUntil(null);
        clearResetCode(farmer);

        log.info("Password successfully reset for farmer [{}]", farmer.getId());

        return new ResetPasswordResponse("Password has been reset successfully. You can now log in with your new password.");
    }

    private static String lockedMessage(LocalDateTime lockedUntil, LocalDateTime now) {
        long minutes = Math.max(1, (long) Math.ceil(java.time.Duration.between(now, lockedUntil).getSeconds() / 60.0));
        return "Too many failed login attempts. Your account is temporarily locked; try again in "
                + minutes + (minutes == 1 ? " minute" : " minutes") + " or reset your password.";
    }

    private void clearResetCode(Farmer farmer) {
        farmer.setPasswordResetToken(null);
        farmer.setPasswordResetExpiresAt(null);
        farmer.setPasswordResetAttempts(0);
        farmerRepository.save(farmer);
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

        Farmer farmer = farmerRepository.findLockedByEmailOrPhone(emailOrPhone.trim().toLowerCase())
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
