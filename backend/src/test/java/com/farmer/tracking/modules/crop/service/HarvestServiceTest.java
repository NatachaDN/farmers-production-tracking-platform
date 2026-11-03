package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.HarvestRequest;
import com.farmer.tracking.modules.crop.api.HarvestResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HarvestServiceTest {

    @Mock
    private HarvestRepository harvestRepository;

    @Mock
    private CycleRepository cycleRepository;

    @InjectMocks
    private HarvestService harvestService;

    private Cycle activeCycle;
    private Cycle completedCycle;
    private Harvest savedHarvest;

    private final Long farmerId  = 1L;
    private final Long cycleId   = 10L;
    private final Long harvestId = 100L;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        activeCycle = new Cycle();
        activeCycle.setId(cycleId);
        activeCycle.setFarmerId(farmerId);
        activeCycle.setName("Maize Season 2026");
        activeCycle.setStatus(CycleStatus.ACTIVE);
        activeCycle.setAcreage(2.5);
        activeCycle.setStartDate(LocalDate.of(2026, 1, 1));

        completedCycle = new Cycle();
        completedCycle.setId(cycleId);
        completedCycle.setFarmerId(farmerId);
        completedCycle.setName("Maize Season 2026");
        completedCycle.setStatus(CycleStatus.COMPLETED);
        completedCycle.setAcreage(2.5);
        completedCycle.setStartDate(LocalDate.of(2026, 1, 1));
        completedCycle.setEndDate(LocalDate.of(2026, 6, 1));

        savedHarvest = new Harvest();
        savedHarvest.setId(harvestId);
        savedHarvest.setCycle(completedCycle);
        savedHarvest.setQuantity(500.0);
        savedHarvest.setUnit(HarvestUnit.KG);
        savedHarvest.setHarvestDate(LocalDate.of(2026, 6, 1));
        savedHarvest.setCalculatedYield(200.0);
        savedHarvest.setNotes("Good yield this season.");
        savedHarvest.setCreatedAt(LocalDateTime.now());
        savedHarvest.setUpdatedAt(LocalDateTime.now());
    }

    // ------------------------------------------------------------------ //
    //  recordHarvest — happy path                                         //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should record harvest, set cycle COMPLETED, and return response with yield")
    void shouldRecordHarvestSuccessfully() {
        HarvestRequest request = new HarvestRequest(
                500.0, HarvestUnit.KG, LocalDate.of(2026, 6, 1), "Good yield");

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(activeCycle));
        when(harvestRepository.existsByCycleId(cycleId)).thenReturn(false);
        when(harvestRepository.save(any(Harvest.class))).thenReturn(savedHarvest);
        when(cycleRepository.save(any(Cycle.class))).thenReturn(completedCycle);

        HarvestResponse response = harvestService.recordHarvest(farmerId, cycleId, request);

        assertThat(response.getId()).isEqualTo(harvestId);
        assertThat(response.getCycleStatus()).isEqualTo(CycleStatus.COMPLETED);
        assertThat(response.getQuantity()).isEqualTo(500.0);
        assertThat(response.getUnit()).isEqualTo(HarvestUnit.KG);
        assertThat(response.getHarvestDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(response.getYieldDisplay()).isNotBlank();
        verify(harvestRepository).save(any(Harvest.class));
        verify(cycleRepository).save(activeCycle);
    }

    @Test
    @DisplayName("Should calculate yield per hectare when acreage is provided")
    void shouldCalculateYieldPerHectareWhenAcreagePresent() {
        HarvestRequest request = new HarvestRequest(
                500.0, HarvestUnit.KG, LocalDate.of(2026, 6, 1), null);
        // activeCycle has acreage 2.5 => expectedYield = 500 / 2.5 = 200.0

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(activeCycle));
        when(harvestRepository.existsByCycleId(cycleId)).thenReturn(false);
        when(harvestRepository.save(any(Harvest.class))).thenReturn(savedHarvest);
        when(cycleRepository.save(any(Cycle.class))).thenReturn(completedCycle);

        HarvestResponse response = harvestService.recordHarvest(farmerId, cycleId, request);

        assertThat(response.getYieldDisplay()).contains("/ ha");
    }

    @Test
    @DisplayName("Should use total output display when acreage is null")
    void shouldUseTotalOutputDisplayWhenAcreageMissing() {
        activeCycle.setAcreage(null);

        Harvest harvestWithoutAcreage = new Harvest();
        harvestWithoutAcreage.setId(harvestId);
        harvestWithoutAcreage.setCycle(activeCycle);
        harvestWithoutAcreage.setQuantity(500.0);
        harvestWithoutAcreage.setUnit(HarvestUnit.BAGS);
        harvestWithoutAcreage.setHarvestDate(LocalDate.of(2026, 6, 1));
        harvestWithoutAcreage.setCalculatedYield(500.0);
        harvestWithoutAcreage.setCreatedAt(LocalDateTime.now());
        harvestWithoutAcreage.setUpdatedAt(LocalDateTime.now());

        HarvestRequest request = new HarvestRequest(
                500.0, HarvestUnit.BAGS, LocalDate.of(2026, 6, 1), null);

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(activeCycle));
        when(harvestRepository.existsByCycleId(cycleId)).thenReturn(false);
        when(harvestRepository.save(any(Harvest.class))).thenReturn(harvestWithoutAcreage);
        when(cycleRepository.save(any(Cycle.class))).thenReturn(activeCycle);

        HarvestResponse response = harvestService.recordHarvest(farmerId, cycleId, request);

        assertThat(response.getYieldDisplay()).contains("total output");
    }

    // ------------------------------------------------------------------ //
    //  recordHarvest — error paths                                        //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should throw ResourceNotFoundException when cycle not found for farmer")
    void shouldThrowWhenCycleNotFoundForFarmer() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> harvestService.recordHarvest(farmerId, cycleId,
                new HarvestRequest(100.0, HarvestUnit.KG, LocalDate.now(), null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(String.valueOf(cycleId));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when cycle is not ACTIVE")
    void shouldThrowWhenCycleIsNotActive() {
        activeCycle.setStatus(CycleStatus.COMPLETED);
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(activeCycle));

        assertThatThrownBy(() -> harvestService.recordHarvest(farmerId, cycleId,
                new HarvestRequest(100.0, HarvestUnit.KG, LocalDate.now(), null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ACTIVE");
    }

    @Test
    @DisplayName("Should throw IllegalStateException when harvest already recorded for cycle")
    void shouldThrowWhenHarvestAlreadyExists() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(activeCycle));
        when(harvestRepository.existsByCycleId(cycleId)).thenReturn(true);

        assertThatThrownBy(() -> harvestService.recordHarvest(farmerId, cycleId,
                new HarvestRequest(100.0, HarvestUnit.KG, LocalDate.now(), null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been recorded");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long id, String role) {
        UserPrincipal principal = new UserPrincipal(id, "test@example.com", "pass",
                List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    // ------------------------------------------------------------------ //
    //  updateHarvest                                                       //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("updateHarvest - recalculates yield, saves record, and syncs the cycle end date")
    void updateHarvest_RecalculatesYieldAndSyncsEndDate() {
        HarvestRequest request = new HarvestRequest(
                750.0, HarvestUnit.KG, LocalDate.of(2026, 7, 15), "Corrected count");

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId)).thenReturn(Optional.of(savedHarvest));
        when(harvestRepository.save(any(Harvest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cycleRepository.save(any(Cycle.class))).thenAnswer(inv -> inv.getArgument(0));

        HarvestResponse response = harvestService.updateHarvest(farmerId, cycleId, request);

        assertThat(response.getQuantity()).isEqualTo(750.0);
        assertThat(response.getUnit()).isEqualTo(HarvestUnit.KG);
        assertThat(response.getHarvestDate()).isEqualTo(LocalDate.of(2026, 7, 15));
        assertThat(response.getCalculatedYield()).isEqualTo(300.0); // 750 / 2.5 ha
        assertThat(completedCycle.getEndDate()).isEqualTo(LocalDate.of(2026, 7, 15));
        verify(harvestRepository).save(savedHarvest);
        verify(cycleRepository).save(completedCycle);
    }

    @Test
    @DisplayName("updateHarvest - throws ResourceNotFoundException when no harvest record exists")
    void updateHarvest_ThrowsWhenNoHarvestExists() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> harvestService.updateHarvest(farmerId, cycleId,
                new HarvestRequest(100.0, HarvestUnit.KG, LocalDate.now(), null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No harvest record found");
    }

    @Test
    @DisplayName("deleteHarvest - removes the record and reopens the cycle as ACTIVE")
    void deleteHarvest_RemovesRecordAndReopensCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId)).thenReturn(Optional.of(savedHarvest));

        harvestService.deleteHarvest(farmerId, cycleId);

        verify(harvestRepository).delete(savedHarvest);
        assertThat(completedCycle.getStatus()).isEqualTo(CycleStatus.ACTIVE);
        assertThat(completedCycle.getEndDate()).isNull();
        verify(cycleRepository).save(completedCycle);
    }

    @Test
    @DisplayName("deleteHarvest - throws ResourceNotFoundException when no harvest record exists")
    void deleteHarvest_ThrowsWhenNoHarvestExists() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> harvestService.deleteHarvest(farmerId, cycleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No harvest record found");

        verify(harvestRepository, never()).delete(any(Harvest.class));
    }

    // ------------------------------------------------------------------ //
    //  Security: farmer data isolation on harvest records                  //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("updateHarvest - Unauthorized when another farmer attempts the correction")
    void updateHarvest_UnauthorizedDifferentFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        assertThatThrownBy(() -> harvestService.updateHarvest(farmerId, cycleId,
                new HarvestRequest(100.0, HarvestUnit.KG, LocalDate.now(), null)))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(cycleRepository, never()).findByIdAndFarmerId(any(), any());
    }

    @Test
    @DisplayName("deleteHarvest - Unauthorized when another farmer attempts deletion")
    void deleteHarvest_UnauthorizedDifferentFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        assertThatThrownBy(() -> harvestService.deleteHarvest(farmerId, cycleId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(harvestRepository, never()).delete(any(Harvest.class));
    }

    @Test
    @DisplayName("updateHarvest - Allowed for ROLE_ADMIN regardless of farmer id")
    void updateHarvest_AdminAllowed() {
        authenticateAs(77L, "ROLE_ADMIN");

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId)).thenReturn(Optional.of(savedHarvest));
        when(harvestRepository.save(any(Harvest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cycleRepository.save(any(Cycle.class))).thenAnswer(inv -> inv.getArgument(0));

        HarvestResponse response = harvestService.updateHarvest(farmerId, cycleId,
                new HarvestRequest(600.0, HarvestUnit.KG, LocalDate.of(2026, 6, 2), null));

        assertThat(response.getQuantity()).isEqualTo(600.0);
    }

    // ------------------------------------------------------------------ //
    //  getHarvestByCycle                                                  //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should return harvest response for a completed cycle")
    void shouldReturnHarvestForCompletedCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId))
                .thenReturn(Optional.of(savedHarvest));

        HarvestResponse response = harvestService.getHarvestByCycle(farmerId, cycleId);

        assertThat(response.getId()).isEqualTo(harvestId);
        assertThat(response.getCycleId()).isEqualTo(cycleId);
        assertThat(response.getQuantity()).isEqualTo(500.0);
        assertThat(response.getUnit()).isEqualTo(HarvestUnit.KG);
        assertThat(response.getHarvestDate()).isEqualTo(LocalDate.of(2026, 6, 1));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when no harvest record exists for cycle")
    void shouldThrowWhenHarvestNotFound() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId))
                .thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(cycleId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> harvestService.getHarvestByCycle(farmerId, cycleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No harvest record found");
    }
}
