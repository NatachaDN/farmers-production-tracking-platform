package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.api.CycleActivityRequest;
import com.farmer.tracking.modules.crop.api.CycleActivityResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for cycle activities.
 * <p>
 * Every public method first verifies that the cycle belongs to the specified
 * farmer, which enforces data‑isolation (security) at the service layer.
 * When Spring Security is added, {@code farmerId} will come from the
 * authenticated principal instead of the URL path.
 * </p>
 */
@Service
public class CycleActivityService {

    private final CycleActivityRepository activityRepository;
    private final CycleRepository cycleRepository;

    public CycleActivityService(CycleActivityRepository activityRepository,
                                 CycleRepository cycleRepository) {
        this.activityRepository = activityRepository;
        this.cycleRepository = cycleRepository;
    }

    /**
     * Returns all activities for a cycle, most recent first.
     */
    @Transactional(readOnly = true)
    public List<CycleActivityResponse> getActivitiesByCycle(Long farmerId, Long cycleId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        return activityRepository.findByCycleIdOrderByActivityDateDesc(cycle.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single activity by its id.
     */
    @Transactional(readOnly = true)
    public CycleActivityResponse getActivity(Long farmerId, Long cycleId, Long activityId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleActivity activity = activityRepository.findByIdAndCycleId(activityId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", activityId));
        return toResponse(activity);
    }

    /**
     * Creates a new activity on an active cycle.
     */
    @Transactional
    public CycleActivityResponse createActivity(Long farmerId, Long cycleId,
                                                  CycleActivityRequest request) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);

        CycleActivity activity = new CycleActivity();
        activity.setCycle(cycle);
        activity.setActivityType(request.getActivityType());
        activity.setActivityDate(request.getActivityDate());
        activity.setNotes(request.getNotes());

        CycleActivity saved = activityRepository.save(activity);
        return toResponse(saved);
    }

    /**
     * Updates an existing activity.
     */
    @Transactional
    public CycleActivityResponse updateActivity(Long farmerId, Long cycleId,
                                                  Long activityId,
                                                  CycleActivityRequest request) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleActivity activity = activityRepository.findByIdAndCycleId(activityId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", activityId));

        activity.setActivityType(request.getActivityType());
        activity.setActivityDate(request.getActivityDate());
        activity.setNotes(request.getNotes());

        CycleActivity updated = activityRepository.save(activity);
        return toResponse(updated);
    }

    /**
     * Deletes an activity from a cycle.
     */
    @Transactional
    public void deleteActivity(Long farmerId, Long cycleId, Long activityId) {
        Cycle cycle = getCycleForFarmer(farmerId, cycleId);
        CycleActivity activity = activityRepository.findByIdAndCycleId(activityId, cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", activityId));
        activityRepository.delete(activity);
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /**
     * Ensures the cycle exists AND belongs to the farmer.
     * This is the main security gate until Spring Security is wired in.
     */
    private Cycle getCycleForFarmer(Long farmerId, Long cycleId) {
        return cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
    }

    /** Maps an entity to the public response DTO. */
    private CycleActivityResponse toResponse(CycleActivity activity) {
        CycleActivityResponse response = new CycleActivityResponse();
        response.setId(activity.getId());
        response.setCycleId(activity.getCycle().getId());
        response.setActivityType(activity.getActivityType());
        response.setActivityDate(activity.getActivityDate());
        response.setNotes(activity.getNotes());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }
}
