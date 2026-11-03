package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleIncidentRequest;
import com.farmer.tracking.modules.crop.api.CycleIncidentResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.IncidentType;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CycleIncidentServiceTest {

    @Mock private CycleIncidentRepository incidentRepository;
    @Mock private CycleRepository          cycleRepository;

    @InjectMocks
    private CycleIncidentService incidentService;

    private Cycle        testCycle;
    private CycleIncident testIncident;

    private final Long farmerId   = 1L;
    private final Long cycleId    = 10L;
    private final Long incidentId = 100L;

    @BeforeEach
    void setUp() {
        testCycle = new Cycle();
        testCycle.setId(cycleId);
        testCycle.setFarmerId(farmerId);
        testCycle.setName("Maize Season 2026");
        testCycle.setStatus(CycleStatus.ACTIVE);
        testCycle.setStartDate(LocalDate.of(2026, 3, 1));

        testIncident = new CycleIncident();
        testIncident.setId(incidentId);
        testIncident.setFarmerId(farmerId);
        testIncident.setCycle(testCycle);
        testIncident.setIncidentType(IncidentType.DISEASE);
        testIncident.setIncidentDate(LocalDate.of(2026, 3, 10));
        testIncident.setDescription("Early blight detected on lower leaves");
        testIncident.setSeverityLevel(3);
        testIncident.setActionTaken("Applied copper-based fungicide");
        testIncident.setCreatedAt(LocalDateTime.now());
    }

    // ------------------------------------------------------------------ //
    //  List incidents                                                      //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should return all incidents for a cycle belonging to the farmer")
    void shouldReturnIncidentsForCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.findByCycleIdOrderByIncidentDateDesc(cycleId))
                .thenReturn(List.of(testIncident));

        List<CycleIncidentResponse> result = incidentService.getIncidentsByCycle(farmerId, cycleId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(incidentId);
        assertThat(result.get(0).getIncidentType()).isEqualTo(IncidentType.DISEASE);
        assertThat(result.get(0).getDescription()).isEqualTo("Early blight detected on lower leaves");
        assertThat(result.get(0).getSeverityLevel()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when farmer does not own the cycle")
    void shouldThrowWhenFarmerDoesNotOwnCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.getIncidentsByCycle(farmerId, cycleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cycle not found");
    }

    // ------------------------------------------------------------------ //
    //  Get single incident                                                 //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should return a specific incident by ID")
    void shouldReturnIncidentById() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.findByIdAndCycleId(incidentId, cycleId))
                .thenReturn(Optional.of(testIncident));

        CycleIncidentResponse result = incidentService.getIncident(farmerId, cycleId, incidentId);

        assertThat(result.getId()).isEqualTo(incidentId);
        assertThat(result.getIncidentType()).isEqualTo(IncidentType.DISEASE);
        assertThat(result.getDescription()).isEqualTo("Early blight detected on lower leaves");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when incident not found in cycle")
    void shouldThrowWhenIncidentNotFound() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.findByIdAndCycleId(999L, cycleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.getIncident(farmerId, cycleId, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ------------------------------------------------------------------ //
    //  Create incident                                                     //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should successfully create a new incident on an active cycle")
    void shouldCreateIncident() {
        CycleIncidentRequest request = new CycleIncidentRequest(
                IncidentType.PEST,
                LocalDate.of(2026, 3, 15),
                "Aphid infestation spotted on stems",
                2,
                "Sprayed neem oil solution"
        );

        CycleIncident savedIncident = new CycleIncident();
        savedIncident.setId(101L);
        savedIncident.setFarmerId(farmerId);
        savedIncident.setCycle(testCycle);
        savedIncident.setIncidentType(request.getIncidentType());
        savedIncident.setIncidentDate(request.getIncidentDate());
        savedIncident.setDescription(request.getDescription());
        savedIncident.setSeverityLevel(request.getSeverityLevel());
        savedIncident.setActionTaken(request.getActionTaken());

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.save(any(CycleIncident.class))).thenReturn(savedIncident);

        CycleIncidentResponse response = incidentService.createIncident(farmerId, cycleId, request);

        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getIncidentType()).isEqualTo(IncidentType.PEST);
        assertThat(response.getDescription()).isEqualTo("Aphid infestation spotted on stems");
        assertThat(response.getSeverityLevel()).isEqualTo(2);
        assertThat(response.getActionTaken()).isEqualTo("Sprayed neem oil solution");
        verify(incidentRepository).save(any(CycleIncident.class));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when recording incident on a non-active cycle")
    void shouldThrowWhenCycleNotActive() {
        testCycle.setStatus(CycleStatus.COMPLETED);
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));

        CycleIncidentRequest request = new CycleIncidentRequest(
                IncidentType.DAMAGE,
                LocalDate.of(2026, 3, 20),
                "Hail damage to crop canopy",
                4,
                null
        );

        assertThatThrownBy(() -> incidentService.createIncident(farmerId, cycleId, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Incidents can only be recorded for an ACTIVE cycle");
    }

    // ------------------------------------------------------------------ //
    //  Update incident                                                     //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should successfully update an existing incident")
    void shouldUpdateIncident() {
        CycleIncidentRequest request = new CycleIncidentRequest(
                IncidentType.WEATHER,
                LocalDate.of(2026, 3, 12),
                "Heavy rain caused waterlogging",
                4,
                "Opened drainage channels"
        );

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.findByIdAndCycleId(incidentId, cycleId))
                .thenReturn(Optional.of(testIncident));
        when(incidentRepository.save(testIncident)).thenReturn(testIncident);

        CycleIncidentResponse response =
                incidentService.updateIncident(farmerId, cycleId, incidentId, request);

        assertThat(response.getIncidentType()).isEqualTo(IncidentType.WEATHER);
        assertThat(response.getDescription()).isEqualTo("Heavy rain caused waterlogging");
        verify(incidentRepository).save(testIncident);
    }

    // ------------------------------------------------------------------ //
    //  Delete incident                                                     //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Should delete an incident")
    void shouldDeleteIncident() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(incidentRepository.findByIdAndCycleId(incidentId, cycleId))
                .thenReturn(Optional.of(testIncident));

        incidentService.deleteIncident(farmerId, cycleId, incidentId);

        verify(incidentRepository).delete(testIncident);
    }
}
