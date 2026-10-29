package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.CycleRequest;
import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.api.PlotConflictCheckResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CycleServiceTest {

    @Mock
    private CycleRepository cycleRepository;

    @Mock
    private PlotRepository plotRepository;

    @Mock
    private HarvestRepository harvestRepository;

    @InjectMocks
    private CycleService cycleService;

    private final Long farmerId = 1L;
    private final Long plotId = 5L;
    private Plot samplePlot;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        samplePlot = new Plot();
        samplePlot.setId(plotId);
        samplePlot.setFarmerId(farmerId);
        samplePlot.setName("Plot A");
        samplePlot.setArea(2.5);
        samplePlot.setLocation("North Sector");
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
    @DisplayName("Given an existing plot, when a cycle is created with crop and planting date, then cycle is saved as active")
    void createCycle_Success() {
        CycleRequest request = new CycleRequest();
        request.setPlotId(plotId);
        request.setCropName("Maize");
        request.setPlantingDate(LocalDate.now());
        request.setPlannedHarvestDate(LocalDate.now().plusMonths(4));
        request.setExpectedQuantity(5000.0);
        request.setExpectedQuantityUnit("kg");

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE)).thenReturn(Optional.empty());
        when(cycleRepository.save(any(Cycle.class))).thenAnswer(invocation -> {
            Cycle c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        CycleResponse response = cycleService.createCycle(farmerId, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getCropName()).isEqualTo("Maize");
        assertThat(response.getPlotName()).isEqualTo("Plot A");
        assertThat(response.getStatus()).isEqualTo(CycleStatus.ACTIVE);
        assertThat(response.getExpectedQuantity()).isEqualTo(5000.0);
        assertThat(response.getExpectedQuantityUnit()).isEqualTo("kg");
        assertThat(response.getPlannedHarvestDate()).isEqualTo(request.getPlannedHarvestDate());

        verify(plotRepository).save(samplePlot);
        verify(cycleRepository).save(any(Cycle.class));
    }

    @Test
    @DisplayName("Given a plot already occupied by active cycle, when a new cycle is created, then ConflictException is thrown")
    void createCycle_ThrowsConflictException_WhenPlotOccupied() {
        Cycle activeCycle = new Cycle();
        activeCycle.setId(20L);
        activeCycle.setName("Existing Maize Cycle");
        activeCycle.setCropName("Maize");
        activeCycle.setStatus(CycleStatus.ACTIVE);
        activeCycle.setPlot(samplePlot);

        CycleRequest request = new CycleRequest();
        request.setPlotId(plotId);
        request.setCropName("Beans");
        request.setPlantingDate(LocalDate.now());
        request.setAllowConflict(false);

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE)).thenReturn(Optional.of(activeCycle));

        assertThatThrownBy(() -> cycleService.createCycle(farmerId, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already occupied by active cycle");

        verify(cycleRepository, never()).save(any(Cycle.class));
    }

    @Test
    @DisplayName("Given a plot occupied by active cycle, when allowConflict is true, then cycle creation proceeds")
    void createCycle_Succeeds_WhenAllowConflictIsTrue() {
        Cycle activeCycle = new Cycle();
        activeCycle.setId(20L);
        activeCycle.setName("Existing Maize Cycle");
        activeCycle.setCropName("Maize");
        activeCycle.setStatus(CycleStatus.ACTIVE);
        activeCycle.setPlot(samplePlot);

        CycleRequest request = new CycleRequest();
        request.setPlotId(plotId);
        request.setCropName("Beans");
        request.setPlantingDate(LocalDate.now());
        request.setAllowConflict(true);

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE)).thenReturn(Optional.of(activeCycle));
        when(cycleRepository.save(any(Cycle.class))).thenAnswer(invocation -> {
            Cycle c = invocation.getArgument(0);
            c.setId(11L);
            return c;
        });

        CycleResponse response = cycleService.createCycle(farmerId, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(11L);
        verify(cycleRepository).save(any(Cycle.class));
    }

    @Test
    @DisplayName("Given non-existent plot or another farmer's plot, when cycle is created, then ResourceNotFoundException is thrown")
    void createCycle_ThrowsNotFound_WhenPlotNotOwned() {
        CycleRequest request = new CycleRequest();
        request.setPlotId(999L);
        request.setCropName("Maize");
        request.setPlantingDate(LocalDate.now());

        when(plotRepository.findByIdAndFarmerId(999L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cycleService.createCycle(farmerId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Plot not found");

        verify(cycleRepository, never()).save(any(Cycle.class));
    }

    @Test
    @DisplayName("Check plot availability returns conflict warning when active cycle present")
    void checkPlotAvailability_ReturnsConflict() {
        Cycle activeCycle = new Cycle();
        activeCycle.setId(20L);
        activeCycle.setName("Maize Cycle");
        activeCycle.setCropName("Maize");
        activeCycle.setStatus(CycleStatus.ACTIVE);

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE)).thenReturn(Optional.of(activeCycle));

        PlotConflictCheckResponse response = cycleService.checkPlotAvailability(farmerId, plotId);

        assertThat(response.isHasConflict()).isTrue();
        assertThat(response.getActiveCycleId()).isEqualTo(20L);
        assertThat(response.getMessage()).contains("already occupied");
    }

    @Test
    @DisplayName("Check plot availability returns no conflict when plot is free")
    void checkPlotAvailability_ReturnsNoConflict() {
        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE)).thenReturn(Optional.empty());

        PlotConflictCheckResponse response = cycleService.checkPlotAvailability(farmerId, plotId);

        assertThat(response.isHasConflict()).isFalse();
        assertThat(response.getActiveCycleId()).isNull();
    }

    @Test
    @DisplayName("Given a completed cycle with harvest in different recorded unit, when cycle detail is fetched, then gap is normalized and computed")
    void getCycleById_CompletedCycleWithHarvest_ComputesGap() {
        Cycle completedCycle = new Cycle();
        completedCycle.setId(30L);
        completedCycle.setFarmerId(farmerId);
        completedCycle.setStatus(CycleStatus.COMPLETED);
        completedCycle.setExpectedQuantity(5000.0);
        completedCycle.setExpectedQuantityUnit("kg");

        Harvest harvest = new Harvest();
        harvest.setQuantity(4.5);
        harvest.setUnit(HarvestUnit.TONS);

        when(cycleRepository.findByIdAndFarmerId(30L, farmerId)).thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(30L)).thenReturn(Optional.of(harvest));

        CycleResponse response = cycleService.getCycleById(farmerId, 30L);

        assertThat(response.getStatus()).isEqualTo(CycleStatus.COMPLETED);
        assertThat(response.getHarvestedQuantity()).isEqualTo(4.5);
        assertThat(response.getHarvestedUnit()).isEqualTo("TONS");
        assertThat(response.getGapQuantity()).isEqualTo(-500.0);
        assertThat(response.getGapPercentage()).isEqualTo(-10.0);
    }

    @Test
    @DisplayName("Given a completed cycle harvested above target, when cycle detail is fetched, then gap is positive")
    void getCycleById_OverTargetHarvest_ComputesPositiveGap() {
        Cycle completedCycle = new Cycle();
        completedCycle.setId(31L);
        completedCycle.setFarmerId(farmerId);
        completedCycle.setStatus(CycleStatus.COMPLETED);
        completedCycle.setExpectedQuantity(2000.0);
        completedCycle.setExpectedQuantityUnit("kg");

        Harvest harvest = new Harvest();
        harvest.setQuantity(2200.5);
        harvest.setUnit(HarvestUnit.KG);

        when(cycleRepository.findByIdAndFarmerId(31L, farmerId)).thenReturn(Optional.of(completedCycle));
        when(harvestRepository.findByCycleId(31L)).thenReturn(Optional.of(harvest));

        CycleResponse response = cycleService.getCycleById(farmerId, 31L);

        assertThat(response.getGapQuantity()).isEqualTo(200.5);
        assertThat(response.getGapPercentage()).isEqualTo(10.0);
    }

    @Test
    @DisplayName("Given a cycle with no harvest recorded, when cycle detail is fetched, then gap fields are null")
    void getCycleById_CycleWithoutHarvest_GapFieldsAreNull() {
        Cycle cycle = new Cycle();
        cycle.setId(32L);
        cycle.setFarmerId(farmerId);
        cycle.setStatus(CycleStatus.ACTIVE);
        cycle.setExpectedQuantity(5000.0);
        cycle.setExpectedQuantityUnit("kg");

        when(cycleRepository.findByIdAndFarmerId(32L, farmerId)).thenReturn(Optional.of(cycle));
        when(harvestRepository.findByCycleId(32L)).thenReturn(Optional.empty());

        CycleResponse response = cycleService.getCycleById(farmerId, 32L);

        assertThat(response.getHarvestedQuantity()).isNull();
        assertThat(response.getHarvestedUnit()).isNull();
        assertThat(response.getGapQuantity()).isNull();
        assertThat(response.getGapPercentage()).isNull();
    }

    @Test
    @DisplayName("Given a harvest recorded in an incompatible unit, when cycle detail is fetched, then gap is not computed")
    void getCycleById_IncompatibleUnits_GapIsNotComputed() {
        Cycle cycle = new Cycle();
        cycle.setId(33L);
        cycle.setFarmerId(farmerId);
        cycle.setStatus(CycleStatus.COMPLETED);
        cycle.setExpectedQuantity(100.0);
        cycle.setExpectedQuantityUnit("kg");

        Harvest harvest = new Harvest();
        harvest.setQuantity(2.0);
        harvest.setUnit(HarvestUnit.BAGS);

        when(cycleRepository.findByIdAndFarmerId(33L, farmerId)).thenReturn(Optional.of(cycle));
        when(harvestRepository.findByCycleId(33L)).thenReturn(Optional.of(harvest));

        CycleResponse response = cycleService.getCycleById(farmerId, 33L);

        assertThat(response.getGapQuantity()).isNull();
        assertThat(response.getGapPercentage()).isNull();
    }

    @Test
    @DisplayName("Given cycles with different planting dates, when listing cycles, then they are sorted by date descending")
    void getCyclesByFarmer_SortedByDateDescending() {
        Cycle newest = new Cycle();
        newest.setId(1L);
        newest.setFarmerId(farmerId);
        newest.setStartDate(LocalDate.of(2026, 9, 20));
        newest.setCropName("Beans");

        Cycle oldest = new Cycle();
        oldest.setId(2L);
        oldest.setFarmerId(farmerId);
        oldest.setStartDate(LocalDate.of(2026, 2, 15));
        oldest.setCropName("Cassava");

        Cycle noDelivered = new Cycle();
        noDelivered.setId(3L);
        noDelivered.setFarmerId(farmerId);
        noDelivered.setStartDate(null);
        noDelivered.setCreatedAt(null);
        noDelivered.setCropName("Legacy");

        when(cycleRepository.findByFarmerId(farmerId)).thenReturn(new ArrayList<>(List.of(oldest, noDelivered, newest)));

        List<CycleResponse> responses = cycleService.getCyclesByFarmer(farmerId, null);

        assertThat(responses).extracting(CycleResponse::getCropName)
                .containsExactly("Beans", "Cassava", "Legacy");
    }

    @Test
    @DisplayName("Given cycles with same planting date, when listing cycles, then ties are broken by newest id first")
    void getCyclesByFarmer_SameDate_TieBrokenByIdDescending() {
        Cycle newer = new Cycle();
        newer.setId(7L);
        newer.setFarmerId(farmerId);
        newer.setStartDate(LocalDate.of(2026, 6, 1));
        newer.setCropName("Pumpkin");

        Cycle older = new Cycle();
        older.setId(4L);
        older.setFarmerId(farmerId);
        older.setStartDate(LocalDate.of(2026, 6, 1));
        older.setCropName("Sorghum");

        when(cycleRepository.findByFarmerId(farmerId)).thenReturn(new ArrayList<>(List.of(older, newer)));

        List<CycleResponse> responses = cycleService.getCyclesByFarmer(farmerId, null);

        assertThat(responses).extracting(CycleResponse::getCropName)
                .containsExactly("Pumpkin", "Sorghum");
    }

    @Test
    @DisplayName("Given another farmer's cycle, when detail is fetched, then ResourceNotFoundException is thrown")
    void getCycleById_NotOwnedCycle_ThrowsNotFound() {
        when(cycleRepository.findByIdAndFarmerId(40L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cycleService.getCycleById(farmerId, 40L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cycle not found");

        verify(harvestRepository, never()).findByCycleId(any());
    }

    // ------------------------------------------------------------------ //
    //  Security: farmer data isolation on the Production overview          //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("validateFarmerAccess - Unauthorized when another farmer lists production cycles")
    void security_ListCycles_UnauthorizedDifferentFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        assertThatThrownBy(() -> cycleService.getCyclesByFarmer(farmerId, null))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(cycleRepository, never()).findByFarmerId(any());
    }

    @Test
    @DisplayName("validateFarmerAccess - Unauthorized when another farmer opens a cycle detail")
    void security_GetCycleDetail_UnauthorizedDifferentFarmer() {
        authenticateAs(999L, "ROLE_FARMER");

        assertThatThrownBy(() -> cycleService.getCycleById(farmerId, 40L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Access denied");

        verify(cycleRepository, never()).findByIdAndFarmerId(any(), any());
        verify(harvestRepository, never()).findByCycleId(any());
    }

    @Test
    @DisplayName("validateFarmerAccess - Allowed when the owner lists their production cycles")
    void security_ListCycles_OwnerAllowed() {
        authenticateAs(1L, "ROLE_FARMER");

        when(cycleRepository.findByFarmerId(farmerId)).thenReturn(new ArrayList<>());

        assertThat(cycleService.getCyclesByFarmer(farmerId, null)).isEmpty();

        verify(cycleRepository).findByFarmerId(farmerId);
    }

    @Test
    @DisplayName("validateFarmerAccess - Allowed when ROLE_ADMIN accesses farmer production data")
    void security_AdminAllowed_ListCycles() {
        authenticateAs(77L, "ROLE_ADMIN");

        when(cycleRepository.findByFarmerId(farmerId)).thenReturn(new ArrayList<>());

        assertThat(cycleService.getCyclesByFarmer(farmerId, null)).isEmpty();

        verify(cycleRepository).findByFarmerId(farmerId);
    }
}
