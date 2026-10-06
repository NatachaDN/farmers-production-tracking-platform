package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleActivityRequest;
import com.farmer.tracking.modules.crop.api.CycleActivityResponse;
import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
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
class CycleActivityServiceTest {

    @Mock
    private CycleActivityRepository activityRepository;

    @Mock
    private CycleRepository cycleRepository;

    @InjectMocks
    private CycleActivityService activityService;

    private Cycle testCycle;
    private CycleActivity testActivity;
    private final Long farmerId = 1L;
    private final Long cycleId = 10L;
    private final Long activityId = 100L;

    @BeforeEach
    void setUp() {
        testCycle = new Cycle();
        testCycle.setId(cycleId);
        testCycle.setFarmerId(farmerId);
        testCycle.setName("Maize Season 2026");
        testCycle.setStatus(CycleStatus.ACTIVE);
        testCycle.setStartDate(LocalDate.of(2026, 3, 1));

        testActivity = new CycleActivity();
        testActivity.setId(activityId);
        testActivity.setCycle(testCycle);
        testActivity.setActivityType(ActivityType.WATERING);
        testActivity.setActivityDate(LocalDate.of(2026, 3, 10));
        testActivity.setNotes("Drip irrigation morning cycle");
        testActivity.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should return all activities for a cycle belonging to the farmer")
    void shouldReturnActivitiesForCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(activityRepository.findByCycleIdOrderByActivityDateDesc(cycleId)).thenReturn(List.of(testActivity));

        List<CycleActivityResponse> result = activityService.getActivitiesByCycle(farmerId, cycleId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(activityId);
        assertThat(result.get(0).getActivityType()).isEqualTo(ActivityType.WATERING);
        assertThat(result.get(0).getActivityDate()).isEqualTo(LocalDate.of(2026, 3, 10));
        assertThat(result.get(0).getNotes()).isEqualTo("Drip irrigation morning cycle");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when farmer does not own the cycle")
    void shouldThrowExceptionWhenFarmerDoesNotOwnCycle() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> activityService.getActivitiesByCycle(farmerId, cycleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cycle not found");
    }

    @Test
    @DisplayName("Should return a specific activity by ID")
    void shouldReturnActivityById() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(activityRepository.findByIdAndCycleId(activityId, cycleId)).thenReturn(Optional.of(testActivity));

        CycleActivityResponse result = activityService.getActivity(farmerId, cycleId, activityId);

        assertThat(result.getId()).isEqualTo(activityId);
        assertThat(result.getActivityType()).isEqualTo(ActivityType.WATERING);
        assertThat(result.getNotes()).isEqualTo("Drip irrigation morning cycle");
    }

    @Test
    @DisplayName("Should successfully create a new cycle activity")
    void shouldCreateActivity() {
        CycleActivityRequest request = new CycleActivityRequest(
                ActivityType.FERTILIZING,
                LocalDate.of(2026, 3, 15),
                "Applied NPK 15-15-15"
        );

        CycleActivity savedActivity = new CycleActivity();
        savedActivity.setId(101L);
        savedActivity.setCycle(testCycle);
        savedActivity.setActivityType(request.getActivityType());
        savedActivity.setActivityDate(request.getActivityDate());
        savedActivity.setNotes(request.getNotes());

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(activityRepository.save(any(CycleActivity.class))).thenReturn(savedActivity);

        CycleActivityResponse response = activityService.createActivity(farmerId, cycleId, request);

        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getActivityType()).isEqualTo(ActivityType.FERTILIZING);
        assertThat(response.getActivityDate()).isEqualTo(LocalDate.of(2026, 3, 15));
        assertThat(response.getNotes()).isEqualTo("Applied NPK 15-15-15");
        verify(activityRepository).save(any(CycleActivity.class));
    }

    @Test
    @DisplayName("Should successfully update an activity")
    void shouldUpdateActivity() {
        CycleActivityRequest request = new CycleActivityRequest(
                ActivityType.TREATMENT,
                LocalDate.of(2026, 3, 12),
                "Fungicide spray applied"
        );

        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(activityRepository.findByIdAndCycleId(activityId, cycleId)).thenReturn(Optional.of(testActivity));
        when(activityRepository.save(testActivity)).thenReturn(testActivity);

        CycleActivityResponse response = activityService.updateActivity(farmerId, cycleId, activityId, request);

        assertThat(response.getActivityType()).isEqualTo(ActivityType.TREATMENT);
        assertThat(response.getNotes()).isEqualTo("Fungicide spray applied");
        verify(activityRepository).save(testActivity);
    }

    @Test
    @DisplayName("Should delete an activity")
    void shouldDeleteActivity() {
        when(cycleRepository.findByIdAndFarmerId(cycleId, farmerId)).thenReturn(Optional.of(testCycle));
        when(activityRepository.findByIdAndCycleId(activityId, cycleId)).thenReturn(Optional.of(testActivity));

        activityService.deleteActivity(farmerId, cycleId, activityId);

        verify(activityRepository).delete(testActivity);
    }
}
