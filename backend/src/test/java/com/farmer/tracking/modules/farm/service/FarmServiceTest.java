package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.api.FarmRequest;
import com.farmer.tracking.modules.farm.api.FarmResponse;
import com.farmer.tracking.modules.farm.entity.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FarmServiceTest {

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private PlotRepository plotRepository;

    @InjectMocks
    private FarmService farmService;

    private final Long farmerId = 1L;
    private final Long farmId = 10L;
    private Farm sampleFarm;

    @BeforeEach
    void setUp() {
        sampleFarm = new Farm(farmerId, "Green Acres Farm", "Nakuru County, Kenya", "Main farm", true);
        sampleFarm.setId(farmId);
    }

    @Test
    @DisplayName("Given farm creation form with valid name, when created, then farm becomes default container for plots")
    void createFarm_Success_BecomesDefaultContainer() {
        FarmRequest request = new FarmRequest("Highland Valley Farm", "Eldoret, Kenya", "Secondary farm", false);

        when(farmRepository.existsByFarmerId(farmerId)).thenReturn(false);
        when(farmRepository.save(any(Farm.class))).thenAnswer(invocation -> {
            Farm f = invocation.getArgument(0);
            f.setId(20L);
            return f;
        });

        FarmResponse response = farmService.createFarm(farmerId, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(20L);
        assertThat(response.getName()).isEqualTo("Highland Valley Farm");
        assertThat(response.getLocation()).isEqualTo("Eldoret, Kenya");
        assertThat(response.getIsDefault()).isTrue(); // First farm automatically default

        verify(farmRepository).save(any(Farm.class));
    }

    @Test
    @DisplayName("Given existing farm, when edited, then changes are saved")
    void updateFarm_Success_SavesChanges() {
        FarmRequest updateRequest = new FarmRequest("Green Valley Organic Farm", "Naivasha, Kenya", "Updated holding", true);

        when(farmRepository.findByIdAndFarmerId(farmId, farmerId)).thenReturn(Optional.of(sampleFarm));
        when(farmRepository.save(any(Farm.class))).thenReturn(sampleFarm);
        when(plotRepository.findByFarmId(farmId)).thenReturn(List.of(
                new Plot(farmerId, sampleFarm, "Plot A", 2.5, "North", "Maize", "Active")
        ));

        FarmResponse response = farmService.updateFarm(farmerId, farmId, updateRequest);

        assertThat(response).isNotNull();
        assertThat(sampleFarm.getName()).isEqualTo("Green Valley Organic Farm");
        assertThat(sampleFarm.getLocation()).isEqualTo("Naivasha, Kenya");
        assertThat(response.getTotalArea()).isEqualTo(2.5);
        assertThat(response.getPlotCount()).isEqualTo(1);

        verify(farmRepository).save(sampleFarm);
    }

    @Test
    @DisplayName("Given non-existent farm or other farmer's farm, when update attempted, throws ResourceNotFoundException")
    void updateFarm_ThrowsNotFound_WhenNotOwned() {
        FarmRequest updateRequest = new FarmRequest("Other Farm", "Location", "Desc", false);

        when(farmRepository.findByIdAndFarmerId(999L, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> farmService.updateFarm(farmerId, 999L, updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Farm not found");

        verify(farmRepository, never()).save(any(Farm.class));
    }

    @Test
    @DisplayName("Get farms returns list with plots and aggregate area")
    void getFarmsByFarmer_ReturnsFarmsList() {
        when(farmRepository.findByFarmerIdOrderByCreatedAtAsc(farmerId)).thenReturn(List.of(sampleFarm));
        when(plotRepository.findByFarmId(farmId)).thenReturn(List.of(
                new Plot(farmerId, sampleFarm, "Plot A", 2.5, "North", "Maize", "Active"),
                new Plot(farmerId, sampleFarm, "Plot B", 1.5, "South", "Beans", "Active")
        ));

        List<FarmResponse> responses = farmService.getFarmsByFarmer(farmerId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getName()).isEqualTo("Green Acres Farm");
        assertThat(responses.get(0).getTotalArea()).isEqualTo(4.0);
        assertThat(responses.get(0).getPlotCount()).isEqualTo(2);
    }
}
