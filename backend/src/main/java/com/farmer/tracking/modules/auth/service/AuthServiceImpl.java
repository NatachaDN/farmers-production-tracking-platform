package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.email.EmailService;
import com.farmer.tracking.common.exception.AccountLockedException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.AccountStatusPolicy;
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

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;
    private static final int MAX_RESET_CODE_ATTEMPTS = 5;
    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid email/phone or password.";

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
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(savedFarmer);

        if (!AccountStatusPolicy.isActive(savedFarmer)) {
            // New farmers must be approved by a manager or administrator before they get a session.
            return new AuthResponse(null, profileResponse,
                    "Registration received. Your account is awaiting approval by a manager or administrator; "
                            + "you will be able to sign in once it is approved.");
        }

        String token = tokenProvider.generateToken(savedFarmer.getId(), savedFarmer.getEmailOrPhone());
        return new AuthResponse(token, profileResponse, "Farmer account registered successfully.");
    }

    @Override
    // Failed-attempt counters must be persisted even though the request ends with an error.
    @Transactional(noRollbackFor = {UnauthorizedException.class, AccountLockedException.class, ForbiddenException.class})
    public AuthResponse login(LoginRequest request) {
        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();

        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));

        LocalDateTime now = LocalDateTime.now();
        if (farmer.getLockedUntil() != null && farmer.getLockedUntil().isAfter(now)) {
            throw new AccountLockedException(lockedMessage(farmer.getLockedUntil(), now));
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

        // Correct password: the counter restarts, then the account status decides
        // (PENDING / REJECTED / SUSPENDED -> 403 with an explanation).
        farmer.setFailedLoginAttempts(0);
        farmer.setLockedUntil(null);
        farmerRepository.save(farmer);
        AccountStatusPolicy.assertCanSignIn(farmer);

        farmer.setLastLoginAt(now);
        farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(farmer.getId(), farmer.getEmailOrPhone());
        FarmerProfileResponse profileResponse = authMapper.toProfileResponse(farmer);

        return new AuthResponse(token, profileResponse, "Login successful.");
    }

    private static String lockedMessage(LocalDateTime lockedUntil, LocalDateTime now) {
        long minutes = Math.max(1, (long) Math.ceil(java.time.Duration.between(now, lockedUntil).getSeconds() / 60.0));
        return "Too many failed login attempts. Your account is temporarily locked; try again in "
                + minutes + (minutes == 1 ? " minute" : " minutes") + " or reset your password.";
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

        // Codes are delivered by email only; phone-number accounts cannot receive them.
        if (!normalizedIdentifier.contains("@")) {
            return new ForgotPasswordResponse(
                    "Password reset codes can only be sent to an email address. If your account uses a phone number, "
                            + "please ask your manager or administrator to reset your password.",
                    normalizedIdentifier);
        }

        // Same answer whether or not the account exists, so the endpoint cannot be used to discover accounts.
        String genericMessage = "If an account exists for " + normalizedIdentifier
                + ", a 6-digit password reset code has been sent to it. Check your inbox (valid for 15 minutes).";

        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier).orElse(null);
        if (farmer == null) {
            log.info("Password reset requested for unknown identifier [{}]", normalizedIdentifier);
            return new ForgotPasswordResponse(genericMessage, normalizedIdentifier);
        }

        String resetCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        // Store reset code directly on Farmer entity
        farmer.setPasswordResetToken(resetCode);
        farmer.setPasswordResetExpiresAt(expiresAt);
        farmer.setPasswordResetAttempts(0);
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

        // The code is never returned to the client: it only travels by email
        // (or appears in the server log when SMTP is not configured, see EmailService).
        return new ForgotPasswordResponse(genericMessage, normalizedIdentifier);
    }

    @Override
    // Wrong-code counters must be persisted even though the request ends with an error.
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
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        String normalizedIdentifier = request.getEmailOrPhone().trim().toLowerCase();
        Farmer farmer = farmerRepository.findByEmailOrPhone(normalizedIdentifier)
                .orElseThrow(() -> new BadRequestException("Invalid reset code. Please check the code or request a new one."));

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
            int attempts = farmer.getPasswordResetAttempts() + 1;
            if (attempts >= MAX_RESET_CODE_ATTEMPTS) {
                // Too many wrong guesses: the current code is burned, a new one must be requested.
                invalidateResetCodes(farmer);
                throw new BadRequestException("Too many incorrect codes. This code is no longer valid; please request a new one.");
            }
            farmer.setPasswordResetAttempts(attempts);
            farmerRepository.save(farmer);
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
        farmer.setPasswordResetAttempts(0);
        // Proving ownership by email also lifts a temporary login lock.
        farmer.setFailedLoginAttempts(0);
        farmer.setLockedUntil(null);
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

    private void invalidateResetCodes(Farmer farmer) {
        farmer.setPasswordResetToken(null);
        farmer.setPasswordResetExpiresAt(null);
        farmer.setPasswordResetAttempts(0);
        farmerRepository.save(farmer);
        if (passwordResetTokenRepository != null) {
            List<PasswordResetToken> open = passwordResetTokenRepository.findByFarmerAndUsedFalse(farmer);
            open.forEach(t -> t.setUsed(true));
            passwordResetTokenRepository.saveAll(open);
        }
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
