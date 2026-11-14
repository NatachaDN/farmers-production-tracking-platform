package com.farmer.tracking.modules.manager.controller;

import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.manager.dto.ManagementOperationsDtos.*;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;
import com.farmer.tracking.modules.manager.service.ManagementOperationsService;
import com.farmer.tracking.modules.manager.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for manager supervision, aggregated analytics, farmer approval workflows,
 * and consolidated multi-farmer production reports.
 * Accessible to users with ROLE_MANAGER or ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/v1/manager")
@Tag(name = "Manager Supervision", description = "Endpoints for cooperative and agricultural network managers")
public class ManagerController {

    private final ManagerService managerService;
    private final ManagementOperationsService operationsService;

    public ManagerController(ManagerService managerService, ManagementOperationsService operationsService) {
        this.managerService = managerService;
        this.operationsService = operationsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Aggregated production dashboard indicators across all supervised farmers (US-33)")
    public ResponseEntity<ManagerDashboardSummary> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(managerService.getDashboardSummary(principal));
    }

    @GetMapping("/farmers")
    @Operation(summary = "List of all registered farmers with optional search, region, crop, and status filtering (US-31, US-32)")
    public ResponseEntity<List<ManagerFarmerRow>> getFarmers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(managerService.getFarmers(search, region, crop, status, sort, principal));
    }

    @GetMapping("/farmers/{id}")
    @Operation(summary = "Drill down into a specific farmer's full agricultural structure and production history (US-33)")
    public ResponseEntity<ManagerFarmerDetail> getFarmerDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(managerService.getFarmerDetail(id, principal));
    }

    @PutMapping("/farmers/{id}/status")
    @Operation(summary = "Approve or reject a farmer's registration status (US-34)")
    public ResponseEntity<ManagerFarmerRow> updateFarmerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmerStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String managerIdentifier = principal != null ? principal.getUsername() : "MANAGER";
        ManagerFarmerRow updated = managerService.updateFarmerStatus(id, request, managerIdentifier, principal);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/productions")
    @Operation(summary = "Supervise all crop cycles, harvest records, and livestock across supervised farmers")
    public ResponseEntity<ManagerProductionsResponse> getSupervisedProductions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long farmerId,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(managerService.getSupervisedProductions(search, farmerId, status, principal));
    }

    @PostMapping("/reports/consolidated")
    @Operation(summary = "Generate a multi-farmer consolidated production report over a given period (US-35)")
    public ResponseEntity<ConsolidatedReportResponse> generateConsolidatedReport(
            @Valid @RequestBody ConsolidatedReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(managerService.generateConsolidatedReport(request, principal));
    }

    @PostMapping(value = "/reports/consolidated/export", produces = "text/csv")
    @Operation(summary = "Export a multi-farmer consolidated production report as CSV (US-35)")
    public ResponseEntity<String> exportConsolidatedReportCsv(
            @Valid @RequestBody ConsolidatedReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String csvContent = managerService.exportConsolidatedReportCsv(request, principal);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"consolidated-production-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvContent);
    }

    // ── Shared Farm, Plot, Animal Group & Incident Management (Admin + Manager) ──

    @GetMapping("/farms")
    @Operation(summary = "List all farms across the platform")
    public ResponseEntity<List<ManagedFarmRow>> listFarms(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listFarms(search, principal));
    }

    @PostMapping("/farms")
    @Operation(summary = "Create a farm for a farmer")
    public ResponseEntity<ManagedFarmRow> createFarm(
            @Valid @RequestBody ManagedFarmRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createFarm(request, principal));
    }

    @PutMapping("/farms/{id}")
    @Operation(summary = "Update a farm")
    public ResponseEntity<ManagedFarmRow> updateFarm(
            @PathVariable Long id,
            @Valid @RequestBody ManagedFarmRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updateFarm(id, request, principal));
    }

    @DeleteMapping("/farms/{id}")
    @Operation(summary = "Delete a farm")
    public ResponseEntity<Void> deleteFarm(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deleteFarm(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/plots")
    @Operation(summary = "List all plots across the platform")
    public ResponseEntity<List<ManagedPlotRow>> listPlots(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long farmId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listPlots(search, farmId, principal));
    }

    @PostMapping("/plots")
    @Operation(summary = "Create a plot")
    public ResponseEntity<ManagedPlotRow> createPlot(
            @Valid @RequestBody ManagedPlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createPlot(request, principal));
    }

    @PutMapping("/plots/{id}")
    @Operation(summary = "Update a plot")
    public ResponseEntity<ManagedPlotRow> updatePlot(
            @PathVariable Long id,
            @Valid @RequestBody ManagedPlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updatePlot(id, request, principal));
    }

    @DeleteMapping("/plots/{id}")
    @Operation(summary = "Delete a plot")
    public ResponseEntity<Void> deletePlot(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deletePlot(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/animal-groups")
    @Operation(summary = "List all animal groups across the platform")
    public ResponseEntity<List<ManagedAnimalGroupRow>> listAnimalGroups(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listAnimalGroups(search, principal));
    }

    @PostMapping("/animal-groups")
    @Operation(summary = "Create an animal group")
    public ResponseEntity<ManagedAnimalGroupRow> createAnimalGroup(
            @Valid @RequestBody ManagedAnimalGroupRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createAnimalGroup(request, principal));
    }

    @PutMapping("/animal-groups/{id}")
    @Operation(summary = "Update an animal group")
    public ResponseEntity<ManagedAnimalGroupRow> updateAnimalGroup(
            @PathVariable Long id,
            @Valid @RequestBody ManagedAnimalGroupRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updateAnimalGroup(id, request, principal));
    }

    @DeleteMapping("/animal-groups/{id}")
    @Operation(summary = "Delete an animal group")
    public ResponseEntity<Void> deleteAnimalGroup(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deleteAnimalGroup(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/incidents")
    @Operation(summary = "List all crop and animal incidents across the platform")
    public ResponseEntity<List<ManagedIncidentRow>> listIncidents(
            @RequestParam(required = false) String kind,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listIncidents(kind, status, search, principal));
    }

    @PutMapping("/incidents/{kind}/{id}/action")
    @Operation(summary = "Take action on a crop or animal incident and optionally notify the farmer")
    public ResponseEntity<ManagedIncidentRow> takeIncidentAction(
            @PathVariable String kind,
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String actorName = principal != null ? principal.getUsername() : "Platform Supervisor";
        Long actorId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(operationsService.takeIncidentAction(kind, id, request, actorName, actorId, principal));
    }

    // ── Shared Crop, Harvest & Input Management (Admin + Manager) ──

    @GetMapping("/crops")
    @Operation(summary = "List all registered crops across the platform")
    public ResponseEntity<List<ManagedCropRow>> listCrops(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listCrops(search, principal));
    }

    @PostMapping("/crops")
    @Operation(summary = "Create a crop for a farmer")
    public ResponseEntity<ManagedCropRow> createCrop(
            @Valid @RequestBody ManagedCropRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createCrop(request, principal));
    }

    @PutMapping("/crops/{id}")
    @Operation(summary = "Update a crop")
    public ResponseEntity<ManagedCropRow> updateCrop(
            @PathVariable Long id,
            @Valid @RequestBody ManagedCropRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updateCrop(id, request, principal));
    }

    @DeleteMapping("/crops/{id}")
    @Operation(summary = "Delete a crop")
    public ResponseEntity<Void> deleteCrop(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deleteCrop(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cycles-summary")
    @Operation(summary = "List cycle options for harvest assignment")
    public ResponseEntity<List<SimpleCycleOption>> listCycleOptions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listCycleOptions(principal));
    }

    @GetMapping("/harvests")
    @Operation(summary = "List all harvests across the platform")
    public ResponseEntity<List<ManagedHarvestRow>> listHarvests(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listHarvests(search, principal));
    }

    @PostMapping("/harvests")
    @Operation(summary = "Record a harvest")
    public ResponseEntity<ManagedHarvestRow> createHarvest(
            @Valid @RequestBody ManagedHarvestRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createHarvest(request, principal));
    }

    @PutMapping("/harvests/{id}")
    @Operation(summary = "Update a harvest")
    public ResponseEntity<ManagedHarvestRow> updateHarvest(
            @PathVariable Long id,
            @Valid @RequestBody ManagedHarvestRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updateHarvest(id, request, principal));
    }

    @DeleteMapping("/harvests/{id}")
    @Operation(summary = "Delete a harvest")
    public ResponseEntity<Void> deleteHarvest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deleteHarvest(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/inputs")
    @Operation(summary = "List all farm inputs across the platform")
    public ResponseEntity<List<ManagedInputRow>> listInputs(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.listInputs(search, principal));
    }

    @PostMapping("/inputs")
    @Operation(summary = "Create a farm input")
    public ResponseEntity<ManagedInputRow> createInput(
            @Valid @RequestBody ManagedInputRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.createInput(request, principal));
    }

    @PutMapping("/inputs/{id}")
    @Operation(summary = "Update a farm input")
    public ResponseEntity<ManagedInputRow> updateInput(
            @PathVariable Long id,
            @Valid @RequestBody ManagedInputRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationsService.updateInput(id, request, principal));
    }

    @DeleteMapping("/inputs/{id}")
    @Operation(summary = "Delete a farm input")
    public ResponseEntity<Void> deleteInput(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        operationsService.deleteInput(id, principal);
        return ResponseEntity.noContent().build();
    }
}
