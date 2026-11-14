package com.farmer.tracking.modules.admin.controller;

import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.common.telemetry.SystemInfoService;
import com.farmer.tracking.common.telemetry.TelemetryService;
import com.farmer.tracking.modules.admin.api.AdminDtos.*;
import com.farmer.tracking.modules.admin.service.AdminService;
import com.farmer.tracking.modules.animal.controller.AnimalGroupRecordController.ProductionRow;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRecordRepository;
import com.farmer.tracking.modules.auth.dto.PasswordChangeRequestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Read-only administration API. Access is restricted to ROLE_ADMIN in SecurityConfig.
 */
@RestController
@RequestMapping({"/api/v1/admin", "/api/v1/manager"})
@Tag(name = "Administration", description = "Platform-wide statistics, activity and telemetry (administrators only)")
public class AdminController {

    private final AdminService adminService;
    private final SystemInfoService systemInfoService;
    private final TelemetryService telemetryService;
    private final AnimalGroupRecordRepository animalRecords;
    private final AuditService auditService;

    public AdminController(AdminService adminService, SystemInfoService systemInfoService,
                           TelemetryService telemetryService, AnimalGroupRecordRepository animalRecords,
                           AuditService auditService) {
        this.adminService = adminService;
        this.systemInfoService = systemInfoService;
        this.telemetryService = telemetryService;
        this.animalRecords = animalRecords;
        this.auditService = auditService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Platform totals, trends, breakdowns and recent activity")
    public Overview overview() {
        return adminService.overview();
    }

    @GetMapping("/farmers")
    @Operation(summary = "All farmer accounts with usage counts")
    public List<FarmerRow> farmers(@RequestParam(required = false) String q) {
        return adminService.farmers(q);
    }

    @GetMapping("/farmers/{id}")
    @Operation(summary = "Full detail of one farmer: farms, plots, cycles, activities, harvests, inputs, account events")
    public FarmerDetail farmer(@PathVariable Long id) {
        return adminService.farmer(id);
    }

    @GetMapping("/activities")
    @Operation(summary = "Field activities recorded across the platform, newest first")
    public List<ActivityRow> activities(@RequestParam(required = false) String type,
                                        @RequestParam(defaultValue = "100") int limit) {
        return adminService.activities(type, limit);
    }

    @GetMapping("/cycles")
    @Operation(summary = "All production cycles with progress and health")
    public List<CycleRow> cycles(@RequestParam(required = false) String status) {
        return adminService.cycles(status);
    }

    @GetMapping("/harvests")
    @Operation(summary = "All recorded harvests")
    public List<HarvestRow> harvests() {
        return adminService.harvests();
    }

    @GetMapping("/livestock-production")
    @Transactional(readOnly = true)
    public List<ProductionRow> livestockProduction(@AuthenticationPrincipal UserPrincipal actor,
                                                    @RequestParam LocalDate from, @RequestParam LocalDate to) {
        if (from.isAfter(to)) throw new BadRequestException("The end date must be on or after the start date.");
        Long managerId = actor.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_MANAGER"))
                ? actor.getId() : null;
        return animalRecords.productionReport(null, managerId, from, to).stream().map(ProductionRow::from).toList();
    }

    @GetMapping("/inputs")
    @Operation(summary = "All farm inputs purchased across the platform")
    public List<InputRow> inputs() {
        return adminService.inputs();
    }

    @GetMapping("/audit")
    @Operation(summary = "Sign-up and sign-in events, newest first")
    public List<AuditRow> audit(@RequestParam(defaultValue = "100") int limit) {
        return adminService.audit(limit);
    }

    @GetMapping("/telemetry")
    @Operation(summary = "Server health, database latency and API traffic since the last restart")
    public Telemetry telemetry() {
        return new Telemetry(Instant.now(), systemInfoService.snapshot(), telemetryService.snapshot());
    }

    @GetMapping("/password-requests")
    @Operation(summary = "List farmer password change requests, optionally filtered by status")
    public List<PasswordChangeRequestResponse> passwordRequests(@RequestParam(required = false) String status) {
        return adminService.passwordChangeRequests(status);
    }

    @PostMapping("/password-requests/{id}/approve")
    @Operation(summary = "Approve a farmer password change request and apply the new password")
    public PasswordChangeRequestResponse approvePasswordRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails admin,
            @RequestBody(required = false) ReviewPasswordChangeRequest body,
            HttpServletRequest http) {
        if (admin == null) {
            throw new UnauthorizedException("Administrator authentication required.");
        }
        String note = body != null ? body.adminNote() : null;
        PasswordChangeRequestResponse response = adminService.approvePasswordChangeRequest(id, admin.getUsername(), note);
        auditService.record(AuditEventType.PASSWORD_CHANGE_APPROVED, response.farmerId(),
                response.farmerName(), "Admin approved password change request #" + id, http);
        return response;
    }

    @PostMapping("/password-requests/{id}/reject")
    @Operation(summary = "Reject a farmer password change request")
    public PasswordChangeRequestResponse rejectPasswordRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails admin,
            @RequestBody(required = false) ReviewPasswordChangeRequest body,
            HttpServletRequest http) {
        if (admin == null) {
            throw new UnauthorizedException("Administrator authentication required.");
        }
        String note = body != null ? body.adminNote() : null;
        PasswordChangeRequestResponse response = adminService.rejectPasswordChangeRequest(id, admin.getUsername(), note);
        auditService.record(AuditEventType.PASSWORD_CHANGE_REJECTED, response.farmerId(),
                response.farmerName(), "Admin rejected password change request #" + id, http);
        return response;
    }
}
