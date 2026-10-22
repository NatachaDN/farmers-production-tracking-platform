package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleRequest;
import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.api.PlotConflictCheckResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
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

    @InjectMocks
    private CycleService cycleService;

    private final Long farmerId = 1L;
    private final Long plotId = 5L;
    private Plot samplePlot;

    @BeforeEach
    void setUp() {
        samplePlot = new Plot();
        samplePlot.setId(plotId);
        samplePlot.setFarmerId(farmerId);
        samplePlot.setName("Plot A");
        samplePlot.setArea(2.5);
        samplePlot.setLocation("North Sector");
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
}
