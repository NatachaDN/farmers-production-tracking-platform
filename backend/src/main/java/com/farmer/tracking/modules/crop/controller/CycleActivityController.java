package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.CycleActivityRequest;
import com.farmer.tracking.modules.crop.api.CycleActivityResponse;
import com.farmer.tracking.modules.crop.service.CycleActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing activities on a crop cycle.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/cycles/{cycleId}/activities}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/cycles/{cycleId}/activities")
@Tag(name = "Cycle Activities", description = "Record and view activities carried out on a crop cycle")
public class CycleActivityController {

    private final CycleActivityService activityService;

    public CycleActivityController(CycleActivityService activityService) {
        this.activityService = activityService;
    }

    // ------------------------------------------------------------------ //
    //  GET  /api/v1/farmers/{farmerId}/cycles/{cycleId}/activities         //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(summary = "List all activities for a cycle",
               description = "Returns the complete activity history for a cycle, most recent first.")
    @ApiResponse(responseCode = "200", description = "Activity list returned")
    @ApiResponse(responseCode = "404", description = "Cycle not found or does not belong to farmer")
    public ResponseEntity<List<CycleActivityResponse>> getAllActivities(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId) {
        List<CycleActivityResponse> activities =
                activityService.getActivitiesByCycle(farmerId, cycleId);
        return ResponseEntity.ok(activities);
    }

    // ------------------------------------------------------------------ //
    //  GET  /…/activities/{activityId}                                     //
    // ------------------------------------------------------------------ //
    @GetMapping("/{activityId}")
    @Operation(summary = "Get a single activity",
               description = "Returns the date, type, and notes of one activity.")
    @ApiResponse(responseCode = "200", description = "Activity returned")
    @ApiResponse(responseCode = "404", description = "Activity or cycle not found")
    public ResponseEntity<CycleActivityResponse> getActivity(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Activity ID") @PathVariable Long activityId) {
        CycleActivityResponse activity =
                activityService.getActivity(farmerId, cycleId, activityId);
        return ResponseEntity.ok(activity);
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/activities         //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(summary = "Record a new activity on a cycle",
               description = "Creates an activity with its type, date, and optional notes.")
    @ApiResponse(responseCode = "201", description = "Activity created")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<CycleActivityResponse> createActivity(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId,
            @Valid @RequestBody CycleActivityRequest request) {
        CycleActivityResponse created =
                activityService.createActivity(farmerId, cycleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ------------------------------------------------------------------ //
    //  PUT  /…/activities/{activityId}                                     //
    // ------------------------------------------------------------------ //
    @PutMapping("/{activityId}")
    @Operation(summary = "Update an existing activity",
               description = "Replaces the type, date, and notes of an existing activity.")
    @ApiResponse(responseCode = "200", description = "Activity updated")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "404", description = "Activity or cycle not found")
    public ResponseEntity<CycleActivityResponse> updateActivity(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Activity ID") @PathVariable Long activityId,
            @Valid @RequestBody CycleActivityRequest request) {
        CycleActivityResponse updated =
                activityService.updateActivity(farmerId, cycleId, activityId, request);
        return ResponseEntity.ok(updated);
    }

    // ------------------------------------------------------------------ //
    //  DELETE /…/activities/{activityId}                                   //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{activityId}")
    @Operation(summary = "Delete an activity",
               description = "Permanently removes an activity from the cycle history.")
    @ApiResponse(responseCode = "204", description = "Activity deleted")
    @ApiResponse(responseCode = "404", description = "Activity or cycle not found")
    public ResponseEntity<Void> deleteActivity(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Activity ID") @PathVariable Long activityId) {
        activityService.deleteActivity(farmerId, cycleId, activityId);
        return ResponseEntity.noContent().build();
    }
}
