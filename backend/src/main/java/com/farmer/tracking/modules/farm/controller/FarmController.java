package com.farmer.tracking.modules.farm.controller;

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
