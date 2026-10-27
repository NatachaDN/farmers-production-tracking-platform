package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.modules.farm.api.FarmRequest;
import com.farmer.tracking.modules.farm.api.FarmResponse;
import com.farmer.tracking.modules.farm.service.FarmService;
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
 * REST controller for managing farmer farms and holdings.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/farms}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/farms")
@Tag(name = "Farms", description = "Create, edit, and organize farmer land holdings and plot containers")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/farms                               //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Create a new farm",
            description = "Registers a new farm structure to group plots under. Can be designated as default container."
    )
    @ApiResponse(responseCode = "201", description = "Farm successfully created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    public ResponseEntity<FarmResponse> createFarm(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Valid @RequestBody FarmRequest request) {
        FarmResponse response = farmService.createFarm(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/farms                                //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all farms for a farmer",
            description = "Returns all farms registered under the authenticated farmer's account with aggregate plot counts and total area."
    )
    @ApiResponse(responseCode = "200", description = "List of farms returned")
    public ResponseEntity<List<FarmResponse>> getFarms(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId) {
        List<FarmResponse> responses = farmService.getFarmsByFarmer(farmerId);
        return ResponseEntity.ok(responses);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/farms/{farmId}                       //
    // ------------------------------------------------------------------ //
    @GetMapping("/{farmId}")
    @Operation(
            summary = "Get farm details by ID",
            description = "Returns farm details by ID if owned by the farmer."
    )
    @ApiResponse(responseCode = "200", description = "Farm details returned")
    @ApiResponse(responseCode = "404", description = "Farm not found")
    public ResponseEntity<FarmResponse> getFarm(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Farm ID")   @PathVariable Long farmId) {
        FarmResponse response = farmService.getFarmById(farmerId, farmId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  PUT /api/v1/farmers/{farmerId}/farms/{farmId}                       //
    // ------------------------------------------------------------------ //
    @PutMapping("/{farmId}")
    @Operation(
            summary = "Update an existing farm",
            description = "Updates farm name, location, and description."
    )
    @ApiResponse(responseCode = "200", description = "Farm updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Farm not found")
    public ResponseEntity<FarmResponse> updateFarm(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Farm ID")   @PathVariable Long farmId,
            @Valid @RequestBody FarmRequest request) {
        FarmResponse response = farmService.updateFarm(farmerId, farmId, request);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  PATCH /api/v1/farmers/{farmerId}/farms/{farmId}/default             //
    // ------------------------------------------------------------------ //
    @PatchMapping("/{farmId}/default")
    @Operation(
            summary = "Set farm as default container",
            description = "Sets the designated farm as the primary default container for new plots."
    )
    @ApiResponse(responseCode = "200", description = "Farm set as default")
    @ApiResponse(responseCode = "404", description = "Farm not found")
    public ResponseEntity<FarmResponse> setDefaultFarm(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Farm ID")   @PathVariable Long farmId) {
        FarmResponse response = farmService.setDefaultFarm(farmerId, farmId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/v1/farmers/{farmerId}/farms/{farmId}                    //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{farmId}")
    @Operation(
            summary = "Delete a farm",
            description = "Deletes a farm belonging to the farmer and reassigns or unlinks any associated plots."
    )
    @ApiResponse(responseCode = "204", description = "Farm successfully deleted")
    @ApiResponse(responseCode = "404", description = "Farm not found")
    public ResponseEntity<Void> deleteFarm(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Farm ID")   @PathVariable Long farmId) {
        farmService.deleteFarm(farmerId, farmId);
        return ResponseEntity.noContent().build();
    }
}
