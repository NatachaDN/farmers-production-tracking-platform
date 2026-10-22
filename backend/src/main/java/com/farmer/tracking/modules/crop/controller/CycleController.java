package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.CycleRequest;
import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.api.PlotConflictCheckResponse;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.service.CycleService;
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
 * REST controller for managing Crop Production Cycles.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/cycles}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/cycles")
@Tag(name = "Crop Production Cycles", description = "Create and follow crop production cycles from planting to harvest")
public class CycleController {

    private final CycleService cycleService;

    public CycleController(CycleService cycleService) {
        this.cycleService = cycleService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/cycles                              //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Create a new crop production cycle",
            description = "Creates a production cycle by selecting a crop, a plot, planting date, expected quantity, and planned harvest date."
    )
    @ApiResponse(responseCode = "201", description = "Production cycle created successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Plot not found")
    @ApiResponse(responseCode = "409", description = "Plot already occupied by active cycle conflict")
    public ResponseEntity<CycleResponse> createCycle(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Valid @RequestBody CycleRequest request) {
        CycleResponse response = cycleService.createCycle(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles                               //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all production cycles for a farmer",
            description = "Returns all cycles belonging to the authenticated farmer, optionally filtered by status (ACTIVE, COMPLETED)."
    )
    @ApiResponse(responseCode = "200", description = "List of production cycles")
    public ResponseEntity<List<CycleResponse>> getCycles(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Optional filter by cycle status") @RequestParam(required = false) CycleStatus status) {
        List<CycleResponse> responses = cycleService.getCyclesByFarmer(farmerId, status);
        return ResponseEntity.ok(responses);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles/{cycleId}                     //
    // ------------------------------------------------------------------ //
    @GetMapping("/{cycleId}")
    @Operation(
            summary = "Get production cycle by ID",
            description = "Returns details of a specific production cycle owned by the farmer."
    )
    @ApiResponse(responseCode = "200", description = "Cycle details returned")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<CycleResponse> getCycle(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId) {
        CycleResponse response = cycleService.getCycleById(farmerId, cycleId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles/check-plot/{plotId}           //
    // ------------------------------------------------------------------ //
    @GetMapping("/check-plot/{plotId}")
    @Operation(
            summary = "Check plot occupancy for active cycles",
            description = "Returns whether the plot is already occupied by an active cycle, along with warning details."
    )
    @ApiResponse(responseCode = "200", description = "Plot availability checked")
    @ApiResponse(responseCode = "404", description = "Plot not found")
    public ResponseEntity<PlotConflictCheckResponse> checkPlotAvailability(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Plot ID")   @PathVariable Long plotId) {
        PlotConflictCheckResponse response = cycleService.checkPlotAvailability(farmerId, plotId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/v1/farmers/{farmerId}/cycles/{cycleId}                  //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{cycleId}")
    @Operation(
            summary = "Delete a production cycle",
            description = "Permanently removes a production cycle owned by the farmer."
    )
    @ApiResponse(responseCode = "204", description = "Cycle deleted successfully")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<Void> deleteCycle(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId) {
        cycleService.deleteCycle(farmerId, cycleId);
        return ResponseEntity.noContent().build();
    }
}
