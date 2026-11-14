package com.farmer.tracking.modules.animal.controller;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.dto.*;
import com.farmer.tracking.modules.animal.service.AnimalRecordsService;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/animals/groups/{groupId}", "/api/animals/groups/{groupId}", "/api/v1/animal-groups/{groupId}"})
public class AnimalRecordsController {

    private final AnimalRecordsService recordsService;
    private final FarmerRepository farmerRepository;

    public AnimalRecordsController(AnimalRecordsService recordsService, FarmerRepository farmerRepository) {
        this.recordsService = recordsService;
        this.farmerRepository = farmerRepository;
    }

    // ---- Productions ----

    @GetMapping("/productions")
    public ResponseEntity<List<AnimalProductionResponse>> getProductions(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(recordsService.getProductions(groupId, extractFarmerId(userDetails)));
    }

    @PostMapping("/productions")
    public ResponseEntity<AnimalProductionResponse> createProduction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @Valid @RequestBody AnimalProductionRequest request
    ) {
        return new ResponseEntity<>(
                recordsService.createProduction(groupId, extractFarmerId(userDetails), request),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/productions/{recordId}")
    public ResponseEntity<Void> deleteProduction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long recordId
    ) {
        recordsService.deleteProduction(groupId, extractFarmerId(userDetails), recordId);
        return ResponseEntity.noContent().build();
    }

    // ---- Activities ----

    @GetMapping("/activities")
    public ResponseEntity<List<AnimalActivityResponse>> getActivities(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(recordsService.getActivities(groupId, extractFarmerId(userDetails)));
    }

    @PostMapping("/activities")
    public ResponseEntity<AnimalActivityResponse> createActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @Valid @RequestBody AnimalActivityRequest request
    ) {
        return new ResponseEntity<>(
                recordsService.createActivity(groupId, extractFarmerId(userDetails), request),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/activities/{activityId}")
    public ResponseEntity<AnimalActivityResponse> updateActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long activityId,
            @Valid @RequestBody AnimalActivityRequest request
    ) {
        return ResponseEntity.ok(recordsService.updateActivity(groupId, extractFarmerId(userDetails), activityId, request));
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long activityId
    ) {
        recordsService.deleteActivity(groupId, extractFarmerId(userDetails), activityId);
        return ResponseEntity.noContent().build();
    }

    // ---- Incidents ----

    @GetMapping("/incidents")
    public ResponseEntity<List<AnimalIncidentResponse>> getIncidents(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(recordsService.getIncidents(groupId, extractFarmerId(userDetails)));
    }

    @PostMapping("/incidents")
    public ResponseEntity<AnimalIncidentResponse> createIncident(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @Valid @RequestBody AnimalIncidentRequest request
    ) {
        return new ResponseEntity<>(
                recordsService.createIncident(groupId, extractFarmerId(userDetails), request),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/incidents/{incidentId}")
    public ResponseEntity<AnimalIncidentResponse> updateIncident(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long incidentId,
            @Valid @RequestBody AnimalIncidentRequest request
    ) {
        return ResponseEntity.ok(recordsService.updateIncident(groupId, extractFarmerId(userDetails), incidentId, request));
    }

    @DeleteMapping("/incidents/{incidentId}")
    public ResponseEntity<Void> deleteIncident(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long incidentId
    ) {
        recordsService.deleteIncident(groupId, extractFarmerId(userDetails), incidentId);
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

