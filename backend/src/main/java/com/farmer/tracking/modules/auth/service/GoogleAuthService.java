package com.farmer.tracking.modules.auth.service;

import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.common.security.JwtTokenProvider;
import com.farmer.tracking.modules.auth.dto.AuthResponse;
import com.farmer.tracking.modules.auth.dto.FarmerProfileResponse;
import com.farmer.tracking.modules.auth.dto.GoogleConfigResponse;
import com.farmer.tracking.modules.auth.mapper.AuthMapper;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * "Sign in with Google": finds or creates the farmer account for a verified Google identity
 * and issues the platform's own JWT, so the rest of the API is unchanged.
 */
@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);

    private final GoogleOAuthClient googleClient;
    private final FarmerRepository farmerRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AdminAccessPolicy adminAccessPolicy;

    public GoogleAuthService(GoogleOAuthClient googleClient,
                             FarmerRepository farmerRepository,
                             AuthMapper authMapper,
                             PasswordEncoder passwordEncoder,
                             JwtTokenProvider tokenProvider,
                             AdminAccessPolicy adminAccessPolicy) {
        this.googleClient = googleClient;
        this.farmerRepository = farmerRepository;
        this.authMapper = authMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.adminAccessPolicy = adminAccessPolicy;
    }

    public GoogleConfigResponse config() {
        return new GoogleConfigResponse(googleClient.isConfigured(), googleClient.isConfigured() ? googleClient.getClientId() : null);
    }

    public GoogleLoginResult login(String code, String redirectUri, String codeVerifier) {
        GoogleIdentity identity = googleClient.exchangeCode(code, redirectUri, codeVerifier);
        return signIn(identity);
    }

    @Transactional
    public GoogleLoginResult signIn(GoogleIdentity identity) {
        Optional<Farmer> existing = farmerRepository.findByGoogleId(identity.subject());
        if (existing.isEmpty()) {
            existing = farmerRepository.findByEmailOrPhone(identity.email());
        }

        boolean created = existing.isEmpty();
        Farmer farmer = existing.orElseGet(() -> newFarmer(identity));

        if (!created) {
            if (farmer.getGoogleId() == null) {
                // First time this existing account signs in with Google. The password was set by
                // whoever registered the email, before Google proved ownership of it, so it is
                // retired: from now on the account is reached through Google.
                farmer.setGoogleId(identity.subject());
                farmer.setAuthProvider("GOOGLE");
                farmer.setPasswordHash(unusablePasswordHash());
                log.info("Linked existing farmer account {} to Google and retired its password", farmer.getId());
            }
            if (identity.pictureUrl() != null) {
                farmer.setAvatarUrl(truncate(identity.pictureUrl(), 512));
            }
        }

        if (adminAccessPolicy.isAdminEmail(identity.email()) && !AdminAccessPolicy.ROLE_ADMIN.equals(farmer.getRole())) {
            farmer.setRole(AdminAccessPolicy.ROLE_ADMIN);
            log.info("Farmer account {} promoted to administrator (allow-listed Google email)", farmer.getId());
        }

        farmer.setLastLoginAt(LocalDateTime.now());
        Farmer saved = farmerRepository.save(farmer);

        String token = tokenProvider.generateToken(saved.getId(), saved.getEmailOrPhone());
        FarmerProfileResponse profile = authMapper.toProfileResponse(saved);
        String message = created ? "Account created with Google." : "Signed in with Google.";
        return new GoogleLoginResult(new AuthResponse(token, profile, message), created);
    }

    private Farmer newFarmer(GoogleIdentity identity) {
        Farmer farmer = new Farmer();
        String name = identity.name() != null ? identity.name().trim() : identity.email().split("@")[0];
        farmer.setFullName(truncate(name, 120));
        farmer.setEmailOrPhone(identity.email());
        farmer.setFarmType(FarmType.MIXED);
        farmer.setPasswordHash(unusablePasswordHash());
        farmer.setRole(AdminAccessPolicy.ROLE_FARMER);
        farmer.setAgreedToTerms(true);
        farmer.setAuthProvider("GOOGLE");
        farmer.setGoogleId(identity.subject());
        farmer.setAvatarUrl(truncate(identity.pictureUrl(), 512));
        return farmer;
    }

    /** A hash of a random value nobody knows: the column is mandatory but password sign-in is impossible. */
    private String unusablePasswordHash() {
        return passwordEncoder.encode(UUID.randomUUID().toString());
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }

    public record GoogleLoginResult(AuthResponse response, boolean newAccount) {}
}
