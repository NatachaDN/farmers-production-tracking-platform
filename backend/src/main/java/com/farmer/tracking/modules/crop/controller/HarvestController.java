package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.HarvestRequest;
import com.farmer.tracking.modules.crop.api.HarvestResponse;
import com.farmer.tracking.modules.crop.service.HarvestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for recording and retrieving crop cycle harvests.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest}
 * </p>
 * <p>
 * Security: the {@code farmerId} path variable enforces ownership —
 * only data belonging to that farmer is accessible.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest")
@Tag(name = "Harvest", description = "Record the harvested yield at the end of a crop cycle")
public class HarvestController {

    private final HarvestService harvestService;

    public HarvestController(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest           //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Record a harvest for a cycle",
            description = "Records the harvested quantity, unit of measure, and date. " +
                          "Transitions the cycle status from ACTIVE to COMPLETED and calculates the yield. " +
                          "Returns 400 if quantity is zero or negative, or if the cycle is not ACTIVE."
    )
    @ApiResponse(responseCode = "201", description = "Harvest recorded and cycle completed")
    @ApiResponse(responseCode = "400", description = "Validation failed or quantity is zero/negative")
    @ApiResponse(responseCode = "404", description = "Cycle not found or does not belong to farmer")
    public ResponseEntity<HarvestResponse> recordHarvest(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")                       @PathVariable Long cycleId,
            @Valid @RequestBody HarvestRequest request) {
        HarvestResponse response = harvestService.recordHarvest(farmerId, cycleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest            //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "Get harvest record for a cycle",
            description = "Returns the harvest details (quantity, unit, date, calculated yield) for a completed cycle."
    )
    @ApiResponse(responseCode = "200", description = "Harvest record returned")
    @ApiResponse(responseCode = "404", description = "Cycle or harvest not found")
    public ResponseEntity<HarvestResponse> getHarvest(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")                       @PathVariable Long cycleId) {
        HarvestResponse response = harvestService.getHarvestByCycle(farmerId, cycleId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  PUT /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest            //
    // ------------------------------------------------------------------ //
    @PutMapping
    @Operation(
            summary = "Correct the harvest record of a cycle",
            description = "Updates quantity, unit, date and details of the recorded harvest and recalculates the yield."
    )
    @ApiResponse(responseCode = "200", description = "Harvest corrected")
    @ApiResponse(responseCode = "404", description = "Cycle or harvest not found")
    public ResponseEntity<HarvestResponse> updateHarvest(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")                       @PathVariable Long cycleId,
            @Valid @RequestBody HarvestRequest request) {
        return ResponseEntity.ok(harvestService.updateHarvest(farmerId, cycleId, request));
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest         //
    // ------------------------------------------------------------------ //
    @DeleteMapping
    @Operation(
            summary = "Delete the harvest record of a cycle",
            description = "Removes a harvest recorded by mistake; the cycle becomes ACTIVE again."
    )
    @ApiResponse(responseCode = "204", description = "Harvest deleted")
    @ApiResponse(responseCode = "404", description = "Cycle or harvest not found")
    public ResponseEntity<Void> deleteHarvest(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")                       @PathVariable Long cycleId) {
        harvestService.deleteHarvest(farmerId, cycleId);
        return ResponseEntity.noContent().build();
    }
}
