package com.farmer.tracking.modules.admin.controller;

import com.farmer.tracking.common.telemetry.SystemInfoService;
import com.farmer.tracking.common.telemetry.TelemetryService;
import com.farmer.tracking.modules.admin.api.AdminDtos.*;
import com.farmer.tracking.modules.admin.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

/**
 * Read-only administration API. Access is restricted to ROLE_ADMIN in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administration", description = "Platform-wide statistics, activity and telemetry (administrators only)")
public class AdminController {

    private final AdminService adminService;
    private final SystemInfoService systemInfoService;
    private final TelemetryService telemetryService;

    public AdminController(AdminService adminService, SystemInfoService systemInfoService, TelemetryService telemetryService) {
        this.adminService = adminService;
        this.systemInfoService = systemInfoService;
        this.telemetryService = telemetryService;
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
}
