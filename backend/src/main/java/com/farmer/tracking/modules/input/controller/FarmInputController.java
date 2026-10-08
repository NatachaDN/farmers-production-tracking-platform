package com.farmer.tracking.modules.input.controller;

import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.service.FarmInputService;
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
 * REST controller for registering and managing farm inputs (seeds, fertilizers, pesticides).
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/inputs}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/inputs")
@Tag(name = "Farm Inputs", description = "Register and manage farm inventory inputs and costs")
public class FarmInputController {

    private final FarmInputService farmInputService;

    public FarmInputController(FarmInputService farmInputService) {
        this.farmInputService = farmInputService;
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/inputs                              //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(
            summary = "Register or update a farm input",
            description = "Registers a new input (seeds, fertilizer, pesticide) with quantity, unit, purchase date, and purchase price. " +
                          "If the input already exists, its stock and cumulative cost are automatically updated."
    )
    @ApiResponse(responseCode = "201", description = "Farm input successfully registered or updated")
    @ApiResponse(responseCode = "400", description = "Validation error (e.g. non-numeric or negative quantity/price)")
    public ResponseEntity<FarmInputResponse> registerInput(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId,
            @Valid @RequestBody FarmInputRequest request) {
        FarmInputResponse response = farmInputService.registerOrUpdateInput(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/inputs                               //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(
            summary = "List all farm inputs",
            description = "Returns all inputs in inventory for the farmer, optionally filtered by input type."
    )
    @ApiResponse(responseCode = "200", description = "List of farm inputs returned")
    public ResponseEntity<List<FarmInputResponse>> getInputs(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId,
            @Parameter(description = "Optional filter by type (SEEDS, FERTILIZER, PESTICIDE, OTHER)") @RequestParam(required = false) InputType type) {
        List<FarmInputResponse> inputs = (type != null)
                ? farmInputService.getInputsByFarmerAndType(farmerId, type)
                : farmInputService.getInputsByFarmer(farmerId);
        return ResponseEntity.ok(inputs);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/farmers/{farmerId}/inputs/{inputId}                      //
    // ------------------------------------------------------------------ //
    @GetMapping("/{inputId}")
    @Operation(
            summary = "Get a farm input by ID",
            description = "Returns input details by ID if owned by the authenticated farmer."
    )
    @ApiResponse(responseCode = "200", description = "Farm input details returned")
    @ApiResponse(responseCode = "404", description = "Farm input not found")
    public ResponseEntity<FarmInputResponse> getInput(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Input ID")  @PathVariable Long inputId) {
        FarmInputResponse response = farmInputService.getInputById(farmerId, inputId);
        return ResponseEntity.ok(response);
    }
}
