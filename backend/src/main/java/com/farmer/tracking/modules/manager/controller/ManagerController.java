package com.farmer.tracking.modules.manager.controller;

import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;
import com.farmer.tracking.modules.manager.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Aggregated production dashboard indicators across all supervised farmers (US-33)")
    public ResponseEntity<ManagerDashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(managerService.getDashboardSummary());
    }

    @GetMapping("/farmers")
    @Operation(summary = "List of all registered farmers with optional search, region, crop, and status filtering (US-31, US-32)")
    public ResponseEntity<List<ManagerFarmerRow>> getFarmers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false, defaultValue = "name") String sort
    ) {
        return ResponseEntity.ok(managerService.getFarmers(search, region, crop, status, sort));
    }

    @GetMapping("/farmers/{id}")
    @Operation(summary = "Drill down into a specific farmer's full agricultural structure and production history (US-33)")
    public ResponseEntity<ManagerFarmerDetail> getFarmerDetail(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.getFarmerDetail(id));
    }

    @PutMapping("/farmers/{id}/status")
    @Operation(summary = "Approve or reject a farmer's registration status (US-34)")
    public ResponseEntity<ManagerFarmerRow> updateFarmerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmerStatusRequest request,
            Principal principal
    ) {
        String managerIdentifier = principal != null ? principal.getName() : "MANAGER";
        ManagerFarmerRow updated = managerService.updateFarmerStatus(id, request, managerIdentifier);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/productions")
    @Operation(summary = "Supervise all crop cycles, harvest records, and livestock across supervised farmers")
    public ResponseEntity<ManagerProductionsResponse> getSupervisedProductions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long farmerId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(managerService.getSupervisedProductions(search, farmerId, status));
    }

    @PostMapping("/reports/consolidated")
    @Operation(summary = "Generate a multi-farmer consolidated production report over a given period (US-35)")
    public ResponseEntity<ConsolidatedReportResponse> generateConsolidatedReport(
            @Valid @RequestBody ConsolidatedReportRequest request
    ) {
        return ResponseEntity.ok(managerService.generateConsolidatedReport(request));
    }

    @PostMapping(value = "/reports/consolidated/export", produces = "text/csv")
    @Operation(summary = "Export a multi-farmer consolidated production report as CSV (US-35)")
    public ResponseEntity<String> exportConsolidatedReportCsv(
            @Valid @RequestBody ConsolidatedReportRequest request
    ) {
        String csvContent = managerService.exportConsolidatedReportCsv(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"consolidated-production-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvContent);
    }
}
