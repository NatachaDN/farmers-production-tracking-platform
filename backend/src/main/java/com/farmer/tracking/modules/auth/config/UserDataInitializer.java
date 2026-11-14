package com.farmer.tracking.modules.auth.config;

import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Seeds or updates default platform administrative users (Admin and Manager)
 * on application startup so they are immediately usable.
 */
@Component
@Order(1)
public class UserDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserDataInitializer.class);

    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataInitializer(FarmerRepository farmerRepository, PasswordEncoder passwordEncoder) {
        this.farmerRepository = farmerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin@gmail.com", "admin", "Platform Administrator", AdminAccessPolicy.ROLE_ADMIN);
        seedUser("manager@gmail.com", "admin", "Cooperative Manager", AdminAccessPolicy.ROLE_MANAGER);
    }

    private void seedUser(String email, String rawPassword, String fullName, String role) {
        String normalizedEmail = email.trim().toLowerCase();
        Optional<Farmer> existing = farmerRepository.findByEmailOrPhone(normalizedEmail);

        if (existing.isPresent()) {
            Farmer user = existing.get();
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setStatus(RegistrationStatus.APPROVED);
            user.setRejectionReason(null);
            farmerRepository.save(user);
            log.info("Platform seeded user synchronized: {} ({})", normalizedEmail, role);
        } else {
            Farmer user = new Farmer();
            user.setFullName(fullName);
            user.setEmailOrPhone(normalizedEmail);
            user.setFarmType(FarmType.MIXED);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setStatus(RegistrationStatus.APPROVED);
            user.setAgreedToTerms(true);
            user.setAuthProvider("LOCAL");
            user.setLocation("Acrea Central Operations");
            user.setFarmName(role.equals(AdminAccessPolicy.ROLE_ADMIN) ? "Administration Headquarters" : "Cooperative Central Farm");
            farmerRepository.save(user);
            log.info("Platform seeded user created: {} ({})", normalizedEmail, role);
        }
    }
}

