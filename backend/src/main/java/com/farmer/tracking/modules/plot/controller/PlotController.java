package com.farmer.tracking.modules.plot.controller;

import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;
import com.farmer.tracking.modules.plot.service.PlotService;
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
 * REST controller for registering and listing farmer plots.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/plots}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/plots")
@Tag(name = "Plots", description = "Register and view land production plots")
public class PlotController {

    private final PlotService plotService;

    public PlotController(PlotService plotService) {
        this.plotService = plotService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/plots                               //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Register a new plot",
            description = "Registers a new production zone with name, area (in ha), and location linked to the farmer."
    )
    @ApiResponse(responseCode = "201", description = "Plot successfully registered")
    @ApiResponse(responseCode = "400", description = "Validation error (e.g. negative or non-numeric area, missing name)")
    public ResponseEntity<PlotResponse> createPlot(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Valid @RequestBody PlotRequest request) {
        PlotResponse response = plotService.createPlot(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/plots                                //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all plots for a farmer",
            description = "Returns all plots registered under the authenticated farmer's account."
    )
    @ApiResponse(responseCode = "200", description = "List of plots returned")
    public ResponseEntity<List<PlotResponse>> getPlots(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId) {
        List<PlotResponse> plots = plotService.getPlotsByFarmer(farmerId);
        return ResponseEntity.ok(plots);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/plots/{plotId}                       //
    // ------------------------------------------------------------------ //
    @GetMapping("/{plotId}")
    @Operation(
            summary = "Get a plot by ID",
            description = "Returns plot details by ID if owned by the farmer."
    )
    @ApiResponse(responseCode = "200", description = "Plot details returned")
    @ApiResponse(responseCode = "404", description = "Plot not found")
    public ResponseEntity<PlotResponse> getPlot(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Plot ID")   @PathVariable Long plotId) {
        PlotResponse response = plotService.getPlotById(farmerId, plotId);
        return ResponseEntity.ok(response);
    }
}
