package com.farmer.tracking.modules.crop.controller;

import com.farmer.tracking.modules.crop.api.CycleIncidentRequest;
import com.farmer.tracking.modules.crop.api.CycleIncidentResponse;
import com.farmer.tracking.modules.crop.service.CycleIncidentService;
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
 * REST controller for managing incidents on a crop cycle.
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents")
@Tag(name = "Cycle Incidents", description = "Record and view incidents (disease, pest, damage) on a crop cycle")
public class CycleIncidentController {

    private final CycleIncidentService incidentService;

    public CycleIncidentController(CycleIncidentService incidentService) {
        this.incidentService = incidentService;
    }

    // ------------------------------------------------------------------ //
    //  GET  /api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents          //
    // ------------------------------------------------------------------ //
    @GetMapping
    @Operation(summary = "List all incidents for a cycle",
               description = "Returns the complete incident history for a cycle, most recent first.")
    @ApiResponse(responseCode = "200", description = "Incident list returned")
    @ApiResponse(responseCode = "404", description = "Cycle not found or does not belong to farmer")
    public ResponseEntity<List<CycleIncidentResponse>> getAllIncidents(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId) {
        return ResponseEntity.ok(incidentService.getIncidentsByCycle(farmerId, cycleId));
    }

    // ------------------------------------------------------------------ //
    //  GET  /…/incidents/{incidentId}                                      //
    // ------------------------------------------------------------------ //
    @GetMapping("/{incidentId}")
    @Operation(summary = "Get a single incident",
               description = "Returns the type, date, and description of one incident.")
    @ApiResponse(responseCode = "200", description = "Incident returned")
    @ApiResponse(responseCode = "404", description = "Incident or cycle not found")
    public ResponseEntity<CycleIncidentResponse> getIncident(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Incident ID") @PathVariable Long incidentId) {
        return ResponseEntity.ok(incidentService.getIncident(farmerId, cycleId, incidentId));
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents          //
    // ------------------------------------------------------------------ //
    @PostMapping
    @Operation(summary = "Record a new incident on a cycle",
               description = "Creates an incident with its type, date, description, and optional severity/action.")
    @ApiResponse(responseCode = "201", description = "Incident created")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "404", description = "Cycle not found")
    public ResponseEntity<CycleIncidentResponse> createIncident(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")  @PathVariable Long cycleId,
            @Valid @RequestBody CycleIncidentRequest request) {
        CycleIncidentResponse created = incidentService.createIncident(farmerId, cycleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ------------------------------------------------------------------ //
    //  PUT  /…/incidents/{incidentId}                                      //
    // ------------------------------------------------------------------ //
    @PutMapping("/{incidentId}")
    @Operation(summary = "Update an existing incident",
               description = "Replaces the type, date, description, severity and action of an existing incident.")
    @ApiResponse(responseCode = "200", description = "Incident updated")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "404", description = "Incident or cycle not found")
    public ResponseEntity<CycleIncidentResponse> updateIncident(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Incident ID") @PathVariable Long incidentId,
            @Valid @RequestBody CycleIncidentRequest request) {
        return ResponseEntity.ok(incidentService.updateIncident(farmerId, cycleId, incidentId, request));
    }

    // ------------------------------------------------------------------ //
    //  DELETE /…/incidents/{incidentId}                                    //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{incidentId}")
    @Operation(summary = "Delete an incident",
               description = "Permanently removes an incident from the cycle history.")
    @ApiResponse(responseCode = "204", description = "Incident deleted")
    @ApiResponse(responseCode = "404", description = "Incident or cycle not found")
    public ResponseEntity<Void> deleteIncident(
            @Parameter(description = "Farmer ID")   @PathVariable Long farmerId,
            @Parameter(description = "Cycle ID")    @PathVariable Long cycleId,
            @Parameter(description = "Incident ID") @PathVariable Long incidentId) {
        incidentService.deleteIncident(farmerId, cycleId, incidentId);
        return ResponseEntity.noContent().build();
    }
}
