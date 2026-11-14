package com.farmer.tracking.modules.dashboard.controller;

import com.farmer.tracking.modules.dashboard.api.FarmerDashboardResponse;
import com.farmer.tracking.modules.dashboard.service.FarmerDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/dashboard")
@Tag(name = "Farmer Dashboard", description = "Real farm metrics, statistics, activities, and harvest summary")
public class FarmerDashboardController {

    private final FarmerDashboardService dashboardService;

    public FarmerDashboardController(FarmerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get farmer dashboard metrics, recent activities, and production history")
    public ResponseEntity<FarmerDashboardResponse> getDashboardSummary(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId) {
        FarmerDashboardResponse response = dashboardService.getDashboardSummary(farmerId);
        return ResponseEntity.ok(response);
    }
}

