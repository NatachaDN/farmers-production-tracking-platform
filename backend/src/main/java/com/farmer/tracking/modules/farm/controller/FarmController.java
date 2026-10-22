package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.modules.farm.api.FarmRequest;
import com.farmer.tracking.modules.farm.api.FarmResponse;
import com.farmer.tracking.modules.farm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@RestController
@RequestMapping({"/api/v1/farms", "/api/farms"})
@Tag(name = "Farm Management", description = "Endpoints for creating, listing, viewing, and updating farmer farm structures")
public class FarmController {

    private final FarmService farmService;
    private final FarmerRepository farmerRepository;

    public FarmController(FarmService farmService, FarmerRepository farmerRepository) {
        this.farmService = farmService;
        this.farmerRepository = farmerRepository;
    }

    @PostMapping
    @Operation(summary = "Create a new farm record for the authenticated farmer")
    public ResponseEntity<FarmResponse> createFarm(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateFarmRequest request) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse response = farmService.createFarm(farmerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Fetch all farms belonging to the authenticated farmer")
    public ResponseEntity<List<FarmResponse>> getFarms(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long farmerId = extractFarmerId(userDetails);
        List<FarmResponse> farms = farmService.getFarmsByFarmer(farmerId);
        return ResponseEntity.ok(farms);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch details for a specific farm (verifies owner data isolation)")
    public ResponseEntity<FarmResponse> getFarmById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse farm = farmService.getFarmById(id, farmerId);
        return ResponseEntity.ok(farm);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update farm details (verifies owner data isolation)")
    public ResponseEntity<FarmResponse> updateFarm(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmRequest request) {
        Long farmerId = extractFarmerId(userDetails);
        FarmResponse updatedFarm = farmService.updateFarm(id, farmerId, request);
        return ResponseEntity.ok(updatedFarm);
    }

    private Long extractFarmerId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal principal) {
            return principal.getId();
        }
        Farmer farmer = farmerRepository.findByEmailOrPhone(userDetails.getUsername().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer not found with username: " + userDetails.getUsername()));
        return farmer.getId();
    }
}
