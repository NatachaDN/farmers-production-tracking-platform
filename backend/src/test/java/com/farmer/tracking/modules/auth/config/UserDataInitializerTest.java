package com.farmer.tracking.modules.auth.config;

import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDataInitializerTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserDataInitializer userDataInitializer;

    @Test
    @DisplayName("Seeds admin and manager accounts when not present")
    void run_SeedsNewUsers_WhenNotPresent() {
        when(farmerRepository.findByEmailOrPhone("admin@gmail.com")).thenReturn(Optional.empty());
        when(farmerRepository.findByEmailOrPhone("manager@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin")).thenReturn("encoded_admin_pass");

        userDataInitializer.run();

        ArgumentCaptor<Farmer> captor = ArgumentCaptor.forClass(Farmer.class);
        verify(farmerRepository, times(2)).save(captor.capture());

        Farmer admin = captor.getAllValues().get(0);
        assertEquals("admin@gmail.com", admin.getEmailOrPhone());
        assertEquals(AdminAccessPolicy.ROLE_ADMIN, admin.getRole());
        assertEquals("encoded_admin_pass", admin.getPasswordHash());
        assertEquals(RegistrationStatus.APPROVED, admin.getStatus());

        Farmer manager = captor.getAllValues().get(1);
        assertEquals("manager@gmail.com", manager.getEmailOrPhone());
        assertEquals(AdminAccessPolicy.ROLE_MANAGER, manager.getRole());
        assertEquals("encoded_admin_pass", manager.getPasswordHash());
        assertEquals(RegistrationStatus.APPROVED, manager.getStatus());
    }

    @Test
    @DisplayName("Updates existing accounts with correct role, status and password")
    void run_UpdatesExistingUsers() {
        Farmer existingAdmin = new Farmer();
        existingAdmin.setEmailOrPhone("admin@gmail.com");
        existingAdmin.setRole(AdminAccessPolicy.ROLE_FARMER);

        Farmer existingManager = new Farmer();
        existingManager.setEmailOrPhone("manager@gmail.com");
        existingManager.setRole(AdminAccessPolicy.ROLE_FARMER);

        when(farmerRepository.findByEmailOrPhone("admin@gmail.com")).thenReturn(Optional.of(existingAdmin));
        when(farmerRepository.findByEmailOrPhone("manager@gmail.com")).thenReturn(Optional.of(existingManager));
        when(passwordEncoder.encode("admin")).thenReturn("encoded_admin_pass");

        userDataInitializer.run();

        assertEquals(AdminAccessPolicy.ROLE_ADMIN, existingAdmin.getRole());
        assertEquals("encoded_admin_pass", existingAdmin.getPasswordHash());
        assertEquals(RegistrationStatus.APPROVED, existingAdmin.getStatus());

        assertEquals(AdminAccessPolicy.ROLE_MANAGER, existingManager.getRole());
        assertEquals("encoded_admin_pass", existingManager.getPasswordHash());
        assertEquals(RegistrationStatus.APPROVED, existingManager.getStatus());

        verify(farmerRepository, times(2)).save(any(Farmer.class));
    }
}

