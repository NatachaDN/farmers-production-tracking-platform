package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlotServiceTest {

    @Mock
    private PlotRepository plotRepository;

    @Mock
    private com.farmer.tracking.modules.farm.repository.FarmRepository farmRepository;

    @Mock
    private com.farmer.tracking.modules.crop.repository.CycleRepository cycleRepository;

    @InjectMocks
    private PlotServiceImpl plotService;

    private Plot samplePlot;
    private final Long farmerId = 1L;
    private final Long plotId = 10L;

    @BeforeEach
    void setUp() {
        samplePlot = new Plot(farmerId, "Plot A — Maize", 2.5, "North Field", "Maize", "Vegetative growth");
        samplePlot.setId(plotId);
        samplePlot.setCreatedAt(LocalDateTime.now());
        samplePlot.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create plot successfully when valid name, area, and location are entered")
    void shouldCreatePlotSuccessfully() {
        PlotRequest request = new PlotRequest("Plot A — Maize", 2.5, "North Field", "Maize", "Vegetative growth");

        when(plotRepository.save(any(Plot.class))).thenReturn(samplePlot);

        PlotResponse response = plotService.createPlot(farmerId, request);

        assertThat(response.getId()).isEqualTo(plotId);
        assertThat(response.getName()).isEqualTo("Plot A — Maize");
        assertThat(response.getArea()).isEqualTo(2.5);
        assertThat(response.getLocation()).isEqualTo("North Field");
        verify(plotRepository).save(any(Plot.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when area is negative")
    void shouldThrowExceptionWhenAreaIsNegative() {
        PlotRequest request = new PlotRequest("Plot B", -1.5, "East Field");

        assertThatThrownBy(() -> plotService.createPlot(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");

        verify(plotRepository, never()).save(any(Plot.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when area is zero")
    void shouldThrowExceptionWhenAreaIsZero() {
        PlotRequest request = new PlotRequest("Plot B", 0.0, "East Field");

        assertThatThrownBy(() -> plotService.createPlot(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");

        verify(plotRepository, never()).save(any(Plot.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when name is missing")
    void shouldThrowExceptionWhenNameIsMissing() {
        PlotRequest request = new PlotRequest("", 2.0, "East Field");

        assertThatThrownBy(() -> plotService.createPlot(farmerId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Plot name is required");
    }

    @Test
    @DisplayName("Should return all plots for authenticated farmer")
    void shouldReturnPlotsByFarmer() {
        when(plotRepository.findByFarmerId(farmerId)).thenReturn(List.of(samplePlot));

        List<PlotResponse> plots = plotService.getPlotsByFarmer(farmerId);

        assertThat(plots).hasSize(1);
        assertThat(plots.get(0).getName()).isEqualTo("Plot A — Maize");
    }

    @Test
    @DisplayName("Should return single plot by ID")
    void shouldReturnPlotById() {
        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));

        PlotResponse response = plotService.getPlotById(farmerId, plotId);

        assertThat(response.getId()).isEqualTo(plotId);
        assertThat(response.getName()).isEqualTo("Plot A — Maize");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when plot not found")
    void shouldThrowWhenPlotNotFound() {
        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> plotService.getPlotById(farmerId, plotId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should update plot successfully when valid data provided")
    void shouldUpdatePlotSuccessfully() {
        PlotRequest updateReq = new PlotRequest("Plot A — Updated", 3.2, "South Field", "Wheat", "Flowering");

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(plotRepository.save(any(Plot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlotResponse response = plotService.updatePlot(farmerId, plotId, updateReq);

        assertThat(response.getName()).isEqualTo("Plot A — Updated");
        assertThat(response.getArea()).isEqualTo(3.2);
        assertThat(response.getLocation()).isEqualTo("South Field");
        assertThat(response.getCropType()).isEqualTo("Wheat");
        assertThat(response.getStage()).isEqualTo("Flowering");
        verify(plotRepository).save(samplePlot);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when updating plot with negative area")
    void shouldThrowExceptionWhenUpdatingWithNegativeArea() {
        PlotRequest updateReq = new PlotRequest("Plot A", -1.0, "South Field");

        assertThatThrownBy(() -> plotService.updatePlot(farmerId, plotId, updateReq))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive number");

        verify(plotRepository, never()).save(any(Plot.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent plot")
    void shouldThrowExceptionWhenUpdatingNonExistentPlot() {
        PlotRequest updateReq = new PlotRequest("Plot NonExistent", 2.0, "Somewhere");
        when(plotRepository.findByIdAndFarmerId(999L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> plotService.updatePlot(farmerId, 999L, updateReq))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should delete plot when no active production cycles exist")
    void shouldDeletePlotSuccessfullyWhenNoActiveCycles() {
        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(cycleRepository.findByPlotId(plotId)).thenReturn(List.of());

        plotService.deletePlot(farmerId, plotId, false);

        verify(plotRepository).delete(samplePlot);
    }

    @Test
    @DisplayName("Should throw ConflictException when deleting plot with active cycle without force")
    void shouldThrowConflictWhenDeletingPlotWithActiveCycleAndNotForced() {
        Cycle activeCycle = new Cycle();
        activeCycle.setName("Maize Season 2026");
        activeCycle.setStatus(CycleStatus.ACTIVE);

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE))
                .thenReturn(Optional.of(activeCycle));

        assertThatThrownBy(() -> plotService.deletePlot(farmerId, plotId, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Cannot delete plot")
                .hasMessageContaining("Maize Season 2026");

        verify(plotRepository, never()).delete(any(Plot.class));
    }

    @Test
    @DisplayName("Should delete plot and unlink cycles when force is true even if active cycle exists")
    void shouldDeletePlotSuccessfullyWhenForcedWithActiveCycle() {
        Cycle activeCycle = new Cycle();
        activeCycle.setName("Maize Season 2026");
        activeCycle.setStatus(CycleStatus.ACTIVE);
        activeCycle.setPlot(samplePlot);

        when(plotRepository.findByIdAndFarmerId(plotId, farmerId)).thenReturn(Optional.of(samplePlot));
        when(cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE))
                .thenReturn(Optional.of(activeCycle));
        when(cycleRepository.findByPlotId(plotId)).thenReturn(List.of(activeCycle));

        plotService.deletePlot(farmerId, plotId, true);

        assertThat(activeCycle.getPlot()).isNull();
        verify(cycleRepository).saveAll(List.of(activeCycle));
        verify(plotRepository).delete(samplePlot);
    }
}
