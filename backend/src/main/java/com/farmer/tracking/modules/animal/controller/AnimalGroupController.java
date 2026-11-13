package com.farmer.tracking.modules.animal.controller;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.dto.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.dto.CreateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.dto.UpdateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.service.AnimalGroupService;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing livestock / animal groups.
 * Base paths: {@code /api/v1/animals/groups}, {@code /api/animals/groups}, {@code /api/v1/animal-groups}
 */
@RestController
@RequestMapping({"/api/v1/animals/groups", "/api/animals/groups", "/api/v1/animal-groups"})
@Tag(name = "Animal Group Management", description = "Endpoints for creating, listing, viewing, updating, and deleting animal groups")
public class AnimalGroupController {

    private final AnimalGroupService animalGroupService;
    private final FarmerRepository farmerRepository;

    public AnimalGroupController(AnimalGroupService animalGroupService, FarmerRepository farmerRepository) {
        this.animalGroupService = animalGroupService;
        this.farmerRepository = farmerRepository;
    }

    @PostMapping
    @Operation(summary = "Register a new animal group for the authenticated farmer")
    @ApiResponse(responseCode = "201", description = "Animal group registered successfully")
    @ApiResponse(responseCode = "400", description = "Validation error or invalid initial population")
    public ResponseEntity<AnimalGroupResponse> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAnimalGroupRequest request
    ) {
        Long farmerId = extractFarmerId(userDetails);
        AnimalGroupResponse response = animalGroupService.createAnimalGroup(farmerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all animal groups belonging to the authenticated farmer")
    @ApiResponse(responseCode = "200", description = "List of animal groups returned")
    public ResponseEntity<List<AnimalGroupResponse>> getGroups(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long farmerId = extractFarmerId(userDetails);
        List<AnimalGroupResponse> groups = animalGroupService.getAnimalGroupsByFarmer(farmerId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get animal group details by ID (enforces farmer data isolation)")
    @ApiResponse(responseCode = "200", description = "Animal group details returned")
    @ApiResponse(responseCode = "403", description = "Farmer does not own this animal group")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    public ResponseEntity<AnimalGroupResponse> getGroupById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long farmerId = extractFarmerId(userDetails);
        AnimalGroupResponse response = animalGroupService.getAnimalGroupById(id, farmerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing animal group (enforces farmer data isolation)")
    @ApiResponse(responseCode = "200", description = "Animal group updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error or negative population")
    @ApiResponse(responseCode = "403", description = "Farmer does not own this animal group")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    public ResponseEntity<AnimalGroupResponse> updateGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAnimalGroupRequest request
    ) {
        Long farmerId = extractFarmerId(userDetails);
        AnimalGroupResponse response = animalGroupService.updateAnimalGroup(id, farmerId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an animal group (enforces farmer data isolation and historical safeguards)")
    @ApiResponse(responseCode = "204", description = "Animal group deleted successfully")
    @ApiResponse(responseCode = "403", description = "Farmer does not own this animal group")
    @ApiResponse(responseCode = "404", description = "Animal group not found")
    @ApiResponse(responseCode = "409", description = "Cannot delete animal group with protected historical dependencies")
    public ResponseEntity<Void> deleteGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long farmerId = extractFarmerId(userDetails);
        animalGroupService.deleteAnimalGroup(id, farmerId);
        return ResponseEntity.noContent().build();
    }

    private Long extractFarmerId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal principal) {
            return principal.getId();
        }
        if (userDetails == null) {
            throw new UnauthorizedException("Unauthorized access: no authenticated user in security context");
        }
        Farmer farmer = farmerRepository.findByEmailOrPhone(userDetails.getUsername().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer not found with username: " + userDetails.getUsername()));
        return farmer.getId();
    }
}
