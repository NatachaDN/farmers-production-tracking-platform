package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.CropRequest;
import com.farmer.tracking.modules.crop.api.CropResponse;
import com.farmer.tracking.modules.crop.service.CropService;
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
 * REST controller for registering and managing a farmer's personal list of crops and varieties.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/crops}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/crops")
@Tag(name = "Crop Catalog", description = "Register and manage personal crop varieties for reuse in production cycles")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/crops                               //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Register a new crop",
            description = "Adds a crop with name and optional variety to the farmer's personal list."
    )
    @ApiResponse(responseCode = "201", description = "Crop registered successfully")
    @ApiResponse(responseCode = "400", description = "Validation error (e.g. blank name)")
    @ApiResponse(responseCode = "409", description = "Crop with this name and variety already exists in the farmer's list")
    public ResponseEntity<CropResponse> registerCrop(
            @Parameter(description = "Farmer ID — enforces data ownership") @PathVariable Long farmerId,
            @Valid @RequestBody CropRequest request) {
        CropResponse response = cropService.registerCrop(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/crops                                //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all crops for a farmer",
            description = "Returns all crops registered by the authenticated farmer, ordered alphabetically by name."
    )
    @ApiResponse(responseCode = "200", description = "List of crops returned")
    public ResponseEntity<List<CropResponse>> getCrops(
            @Parameter(description = "Farmer ID — enforces data ownership") @PathVariable Long farmerId) {
        List<CropResponse> crops = cropService.getCropsByFarmer(farmerId);
        return ResponseEntity.ok(crops);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/crops/{cropId}                       //
    // ------------------------------------------------------------------ //
    @GetMapping("/{cropId}")
    @Operation(
            summary = "Get a crop by ID",
            description = "Returns crop details by ID if owned by the authenticated farmer."
    )
    @ApiResponse(responseCode = "200", description = "Crop details returned")
    @ApiResponse(responseCode = "404", description = "Crop not found")
    public ResponseEntity<CropResponse> getCrop(
            @Parameter(description = "Farmer ID — enforces data ownership") @PathVariable Long farmerId,
            @Parameter(description = "Crop ID") @PathVariable Long cropId) {
        CropResponse response = cropService.getCropById(farmerId, cropId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  PUT /api/v1/farmers/{farmerId}/crops/{cropId}                       //
    // ------------------------------------------------------------------ //
    @PutMapping("/{cropId}")
    @Operation(
            summary = "Update a crop",
            description = "Updates the name or variety of a registered crop."
    )
    @ApiResponse(responseCode = "200", description = "Crop updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Crop not found")
    public ResponseEntity<CropResponse> updateCrop(
            @Parameter(description = "Farmer ID — enforces data ownership") @PathVariable Long farmerId,
            @Parameter(description = "Crop ID") @PathVariable Long cropId,
            @Valid @RequestBody CropRequest request) {
        CropResponse response = cropService.updateCrop(farmerId, cropId, request);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/v1/farmers/{farmerId}/crops/{cropId}                    //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{cropId}")
    @Operation(
            summary = "Delete a crop",
            description = "Removes a crop from the farmer's personal list."
    )
    @ApiResponse(responseCode = "204", description = "Crop deleted successfully")
    @ApiResponse(responseCode = "404", description = "Crop not found")
    public ResponseEntity<Void> deleteCrop(
            @Parameter(description = "Farmer ID — enforces data ownership") @PathVariable Long farmerId,
            @Parameter(description = "Crop ID") @PathVariable Long cropId) {
        cropService.deleteCrop(farmerId, cropId);
        return ResponseEntity.noContent().build();
    }
}
