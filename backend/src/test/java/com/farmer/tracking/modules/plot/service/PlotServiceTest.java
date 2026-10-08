package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
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
}
