package com.farmer.tracking.modules.admin.config;

import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;

/**
 * Optionally creates (or promotes) an administrator at startup from environment variables
 * ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD. Does nothing when they are not set.
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public AdminBootstrap(FarmerRepository farmerRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.bootstrap-email:}") String email,
                          @Value("${app.admin.bootstrap-password:}") String password,
                          @Value("${app.admin.bootstrap-name:Platform Admin}") String name) {
        this.farmerRepository = farmerRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        this.password = password == null ? "" : password;
        this.name = name == null || name.isBlank() ? "Platform Admin" : name.trim();
    }

    @Override
    public void run(String... args) {
        if (email.isEmpty() || password.isEmpty()) {
            return;
        }
        if (password.length() < 8 || password.length() > 72) {
            log.warn("ADMIN_BOOTSTRAP_PASSWORD must be between 8 and 72 characters; admin bootstrap skipped.");
            return;
        }

        Optional<Farmer> existing = farmerRepository.findByEmailOrPhone(email);
        if (existing.isPresent()) {
            Farmer farmer = existing.get();
            if (!AdminAccessPolicy.ROLE_ADMIN.equals(farmer.getRole())) {
                farmer.setRole(AdminAccessPolicy.ROLE_ADMIN);
                farmerRepository.save(farmer);
                log.info("Existing account {} promoted to administrator.", email);
            }
            return;
        }

        Farmer admin = new Farmer();
        admin.setFullName(name);
        admin.setEmailOrPhone(email);
        admin.setFarmType(FarmType.MIXED);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(AdminAccessPolicy.ROLE_ADMIN);
        admin.setAgreedToTerms(true);
        admin.setAuthProvider("LOCAL");
        farmerRepository.save(admin);
        log.info("Administrator account created for {}.", email);
    }
}
