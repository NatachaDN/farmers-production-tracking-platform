package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.CropRequest;
import com.farmer.tracking.modules.crop.api.CropResponse;
import com.farmer.tracking.modules.crop.entity.Crop;
import com.farmer.tracking.modules.crop.repository.CropRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CropServiceTest {

    @Mock
    private CropRepository cropRepository;

    @InjectMocks
    private CropServiceImpl cropService;

    private final Long farmerId = 1L;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long id, String role) {
        UserPrincipal principal = new UserPrincipal(id, "test@example.com", "pass", List.of(new SimpleGrantedAuthority(role)));
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    @Test
    @DisplayName("registerCrop - Success: adds new crop with name and variety")
    void registerCrop_Success_WithNameAndVariety() {
        CropRequest request = new CropRequest("Maize", "Hybrid 614");

        when(cropRepository.existsByFarmerIdAndNameIgnoreCaseAndVarietyIgnoreCase(farmerId, "Maize", "Hybrid 614"))
                .thenReturn(false);

        Crop saved = new Crop(farmerId, "Maize", "Hybrid 614");
        saved.setId(10L);
        saved.setCreatedAt(LocalDateTime.now());
        saved.setUpdatedAt(LocalDateTime.now());

        when(cropRepository.save(any(Crop.class))).thenReturn(saved);

        CropResponse response = cropService.registerCrop(farmerId, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getName()).isEqualTo("Maize");
        assertThat(response.getVariety()).isEqualTo("Hybrid 614");
        assertThat(response.getDisplayName()).isEqualTo("Maize (Hybrid 614)");

        verify(cropRepository).save(any(Crop.class));
    }

    @Test
    @DisplayName("registerCrop - Success: adds new crop with name only (no variety)")
    void registerCrop_Success_WithNameOnly() {
        CropRequest request = new CropRequest("Tomatoes", null);

        when(cropRepository.existsByFarmerIdAndNameIgnoreCase(farmerId, "Tomatoes"))
                .thenReturn(false);

        Crop saved = new Crop(farmerId, "Tomatoes", null);
        saved.setId(11L);

        when(cropRepository.save(any(Crop.class))).thenReturn(saved);

        CropResponse response = cropService.registerCrop(farmerId, request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Tomatoes");
        assertThat(response.getVariety()).isNull();
        assertThat(response.getDisplayName()).isEqualTo("Tomatoes");
    }

    @Test
    @DisplayName("registerCrop - Fails: blank name throws IllegalArgumentException")
    void registerCrop_Fails_BlankName() {
        CropRequest request = new CropRequest("   ", "Variety X");

        assertThatThrownBy(() -> cropService.registerCrop(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Crop name is required");

        verify(cropRepository, never()).save(any(Crop.class));
    }

    @Test
    @DisplayName("registerCrop - Fails: duplicate crop throws ConflictException")
    void registerCrop_Fails_DuplicateCrop() {
        CropRequest request = new CropRequest("Maize", "Hybrid 614");

        when(cropRepository.existsByFarmerIdAndNameIgnoreCaseAndVarietyIgnoreCase(farmerId, "Maize", "Hybrid 614"))
                .thenReturn(true);

        assertThatThrownBy(() -> cropService.registerCrop(farmerId, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already in your personal crops list");

        verify(cropRepository, never()).save(any(Crop.class));
    }

    @Test
    @DisplayName("getCropsByFarmer - Returns all crops for the farmer")
    void getCropsByFarmer_Success() {
        Crop c1 = new Crop(farmerId, "Beans", "Rosecoco");
        c1.setId(1L);
        Crop c2 = new Crop(farmerId, "Maize", "Hybrid 614");
        c2.setId(2L);

        when(cropRepository.findByFarmerIdOrderByNameAsc(farmerId)).thenReturn(List.of(c1, c2));

        List<CropResponse> list = cropService.getCropsByFarmer(farmerId);

        assertThat(list).hasSize(2);
        assertThat(list.get(0).getName()).isEqualTo("Beans");
        assertThat(list.get(1).getName()).isEqualTo("Maize");
    }

    @Test
    @DisplayName("getCropById - Success when found")
    void getCropById_Success() {
        Crop crop = new Crop(farmerId, "Cassava", "Migyera");
        crop.setId(5L);

        when(cropRepository.findByIdAndFarmerId(5L, farmerId)).thenReturn(Optional.of(crop));

        CropResponse response = cropService.getCropById(farmerId, 5L);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Cassava");
    }

    @Test
    @DisplayName("getCropById - Throws ResourceNotFoundException when not found")
    void getCropById_NotFound() {
        when(cropRepository.findByIdAndFarmerId(99L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cropService.getCropById(farmerId, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Crop not found with id: 99");
    }

    @Test
    @DisplayName("updateCrop - Updates name and variety")
    void updateCrop_Success() {
        Crop existing = new Crop(farmerId, "Maize", "H614");
        existing.setId(2L);

        when(cropRepository.findByIdAndFarmerId(2L, farmerId)).thenReturn(Optional.of(existing));
        when(cropRepository.save(any(Crop.class))).thenAnswer(inv -> inv.getArgument(0));

        CropRequest updateReq = new CropRequest("Yellow Maize", "Hybrid 624");
        CropResponse updated = cropService.updateCrop(farmerId, 2L, updateReq);

        assertThat(updated.getName()).isEqualTo("Yellow Maize");
        assertThat(updated.getVariety()).isEqualTo("Hybrid 624");
    }

    @Test
    @DisplayName("deleteCrop - Deletes crop when owned by farmer")
    void deleteCrop_Success() {
        Crop existing = new Crop(farmerId, "Rice", "Basmati");
        existing.setId(7L);

        when(cropRepository.findByIdAndFarmerId(7L, farmerId)).thenReturn(Optional.of(existing));

        cropService.deleteCrop(farmerId, 7L);

        verify(cropRepository).delete(existing);
    }

    @Test
    @DisplayName("validateFarmerAccess - Unauthorized when another farmer attempts access")
    void security_UnauthorizedDifferentFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        CropRequest request = new CropRequest("Wheat", "Kenya Hero");

        assertThatThrownBy(() -> cropService.registerCrop(farmerId, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(cropRepository, never()).save(any(Crop.class));
    }

    @Test
    @DisplayName("validateFarmerAccess - Allowed when ROLE_ADMIN accesses farmer data")
    void security_AdminAllowed() {
        authenticateAs(999L, "ROLE_ADMIN");

        when(cropRepository.findByFarmerIdOrderByNameAsc(farmerId)).thenReturn(Collections.emptyList());

        List<CropResponse> list = cropService.getCropsByFarmer(farmerId);
        assertThat(list).isEmpty();
    }
}
