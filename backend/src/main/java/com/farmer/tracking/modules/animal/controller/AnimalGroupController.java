package com.farmer.tracking.modules.animal.controller;

import com.farmer.tracking.modules.animal.api.AnimalGroupRequest;
import com.farmer.tracking.modules.animal.api.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.service.AnimalGroupService;
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
 * REST controller for managing animal groups (livestock).
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/animals}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/animals")
@Tag(name = "Animals", description = "Register and manage animal groups for production tracking")
public class AnimalGroupController {

    private final AnimalGroupService animalGroupService;

    public AnimalGroupController(AnimalGroupService animalGroupService) {
        this.animalGroupService = animalGroupService;
    }

    @PostMapping
    @Operation(
            summary = "Register a new animal group",
            description = "Registers a livestock group specifying animal type, production purpose, number of animals, and start date."
    )
    @ApiResponse(responseCode = "201", description = "Animal group successfully registered")
    @ApiResponse(responseCode = "400", description = "Validation error")
    public ResponseEntity<AnimalGroupResponse> registerGroup(
            @Parameter(description = "Farmer ID — enforces ownership") @PathVariable Long farmerId,
            @Valid @RequestBody AnimalGroupRequest request) {
        AnimalGroupResponse response = animalGroupService.registerGroup(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "List all animal groups for a farmer",
            description = "Returns all animal groups registered under the authenticated farmer's account."
    )
    @ApiResponse(responseCode = "200", description = "List of animal groups returned")
    public ResponseEntity<List<AnimalGroupResponse>> getGroups(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId) {
        List<AnimalGroupResponse> responses = animalGroupService.getGroupsByFarmer(farmerId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{groupId}")
    @Operation(
            summary = "Get animal group details by ID",
            description = "Returns animal group details by ID if owned by the farmer."
    )
    @ApiResponse(responseCode = "200", description = "Animal group details returned")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    public ResponseEntity<AnimalGroupResponse> getGroup(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Animal group ID") @PathVariable Long groupId) {
        AnimalGroupResponse response = animalGroupService.getGroupById(farmerId, groupId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{groupId}")
    @Operation(
            summary = "Update an existing animal group",
            description = "Updates animal group type, purpose, number of animals, start date, or notes."
    )
    @ApiResponse(responseCode = "200", description = "Animal group updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    public ResponseEntity<AnimalGroupResponse> updateGroup(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Animal group ID") @PathVariable Long groupId,
            @Valid @RequestBody AnimalGroupRequest request) {
        AnimalGroupResponse response = animalGroupService.updateGroup(farmerId, groupId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{groupId}")
    @Operation(
            summary = "Delete an animal group",
            description = "Deletes an animal group belonging to the authenticated farmer."
    )
    @ApiResponse(responseCode = "204", description = "Animal group successfully deleted")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    public ResponseEntity<Void> deleteGroup(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Animal group ID") @PathVariable Long groupId) {
        animalGroupService.deleteGroup(farmerId, groupId);
        return ResponseEntity.noContent().build();
    }
}
