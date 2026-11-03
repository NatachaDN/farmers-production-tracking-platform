package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.CycleCostSummaryResponse;
import com.farmer.tracking.modules.crop.api.CycleInputUsageRequest;
import com.farmer.tracking.modules.crop.api.CycleInputUsageResponse;
import com.farmer.tracking.modules.crop.service.CycleInputUsageService;
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
 * REST controller for recording and tracking inputs consumed on a crop production cycle.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs")
@Tag(name = "Cycle Input Consumptions", description = "Record inputs used on crop cycles, deduct inventory stock, and calculate real cost")
public class CycleInputUsageController {

    private final CycleInputUsageService cycleInputUsageService;

    public CycleInputUsageController(CycleInputUsageService cycleInputUsageService) {
        this.cycleInputUsageService = cycleInputUsageService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs             //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Record input consumption on a cycle",
            description = "Links an input item and quantity used to an active crop cycle, deducts from available stock, and calculates total real cost. " +
                          "Fails if the cycle is not ACTIVE or if the used quantity exceeds available inventory stock."
    )
    @ApiResponse(responseCode = "201", description = "Input consumption recorded and stock deducted successfully")
    @ApiResponse(responseCode = "400", description = "Validation failure, cycle not ACTIVE, or insufficient stock")
    @ApiResponse(responseCode = "404", description = "Cycle or farm input not found")
    public ResponseEntity<CycleInputUsageResponse> recordInputUsage(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Production Cycle ID")             @PathVariable Long cycleId,
            @Valid @RequestBody CycleInputUsageRequest request) {
        CycleInputUsageResponse response = cycleInputUsageService.recordInputUsage(farmerId, cycleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs              //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all inputs consumed on a cycle",
            description = "Returns all inputs used on the specified production cycle, ordered by application date descending."
    )
    @ApiResponse(responseCode = "200", description = "List of input consumptions returned")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<List<CycleInputUsageResponse>> getInputsByCycle(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Production Cycle ID")             @PathVariable Long cycleId) {
        List<CycleInputUsageResponse> usages = cycleInputUsageService.getInputsByCycle(farmerId, cycleId);
        return ResponseEntity.ok(usages);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/summary      //
    // ------------------------------------------------------------------ //
    @GetMapping("/summary")
    @Operation(
            summary = "Get cycle real input cost summary",
            description = "Calculates total real input expenditure for the cycle, with breakdown by input type (seeds, fertilizer, pesticide)."
    )
    @ApiResponse(responseCode = "200", description = "Cost summary returned successfully")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<CycleCostSummaryResponse> getCycleCostSummary(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Production Cycle ID")             @PathVariable Long cycleId) {
        CycleCostSummaryResponse summary = cycleInputUsageService.getCycleCostSummary(farmerId, cycleId);
        return ResponseEntity.ok(summary);
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs/{usageId} //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{usageId}")
    @Operation(
            summary = "Delete input consumption and restore stock",
            description = "Removes an input usage record from the cycle and restores the deducted quantity back to inventory stock."
    )
    @ApiResponse(responseCode = "204", description = "Input consumption deleted and stock restored")
    @ApiResponse(responseCode = "404", description = "Record not found")
    public ResponseEntity<Void> deleteInputUsage(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Parameter(description = "Production Cycle ID")             @PathVariable Long cycleId,
            @Parameter(description = "Input Usage ID")                  @PathVariable Long usageId) {
        cycleInputUsageService.deleteInputUsage(farmerId, cycleId, usageId);
        return ResponseEntity.noContent().build();
    }
}
