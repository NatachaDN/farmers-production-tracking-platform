package com.farmer.tracking.modules.admin.api;

import com.farmer.tracking.common.telemetry.SystemInfoService.SystemSnapshot;
import com.farmer.tracking.common.telemetry.TelemetryService.TrafficSnapshot;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Read-only payloads served to the administration console.
 */
public final class AdminDtos {

    private AdminDtos() {}

    public record Count(String label, long count) {}

    public record DayCount(LocalDate date, long count) {}

    public record MonthlyHarvest(String month, double kg, double bags) {}

    public record CropOutput(String crop, double kg, double bags, long harvests) {}

    public record InputSpend(String type, long items, double spent) {}

    public record TopFarmer(Long id, String name, long cycles, long activities, double harvestedKg) {}

    public record Totals(long farmers, long admins, long googleAccounts, long farms, long plots, double plotAreaHa,
                         long cycles, long activeCycles, long completedCycles, long cancelledCycles,
                         long activities, long harvests, long inputs, double inputSpend) {}

    public record Highlights(long newFarmers7d, long newFarmers30d, long signedInFarmers7d,
                             long activities7d, long activitiesPrev7d,
                             double harvestedKg, double harvestedBags, double avgCycleProgress,
                             long overdueCycles, long idleCycles) {}

    public record Overview(Instant generatedAt, Totals totals, Highlights highlights,
                           List<Count> farmersByType, List<Count> cyclesByStatus, List<Count> activitiesByType,
                           List<Count> activeCyclesByStage, List<CropOutput> harvestByCrop, List<InputSpend> inputsByType,
                           List<DayCount> activitiesPerDay, List<DayCount> signupsPerDay,
                           List<MonthlyHarvest> harvestPerMonth, List<TopFarmer> topFarmers,
                           List<CycleRow> attention, List<ActivityRow> recentActivities,
                           List<AuditRow> recentAuditEvents) {}

    public record FarmerRow(Long id, String fullName, String emailOrPhone, String location, String farmType,
                            String role, String authProvider, String avatarUrl,
                            Instant createdAt, Instant lastLoginAt,
                            long farms, long plots, long cycles, long activeCycles, long activities,
                            double harvestedKg, double inputSpend) {}

    public record FarmRow(Long id, String name, String location, Double size, boolean isDefault, long plots) {}

    public record PlotRow(Long id, String name, Double area, String location, String cropType, String stage,
                          String farmName) {}

    public record HarvestSummary(Double quantity, String unit, LocalDate date, Double yield) {}

    public record CycleRow(Long id, String name, String cropName, String plotName, Long farmerId, String farmerName,
                           String status, String stage, Integer progress, Double acreage,
                           LocalDate startDate, LocalDate endDate, Double expectedQuantity, String expectedUnit,
                           long activityCount, LocalDate lastActivityDate, String health, HarvestSummary harvest) {}

    public record ActivityRow(Long id, String type, LocalDate activityDate, String notes, Instant recordedAt,
                              Long cycleId, String cycleName, String cropName, String plotName,
                              Long farmerId, String farmerName) {}

    public record HarvestRow(Long id, Long cycleId, String cycleName, String cropName, Long farmerId, String farmerName,
                             Double quantity, String unit, LocalDate harvestDate, Double yield, String notes) {}

    public record InputRow(Long id, Long farmerId, String farmerName, String name, String type, Double quantity,
                           String unit, LocalDate purchaseDate, Double purchasePrice, Double cumulativeCost) {}

    public record AuditRow(Long id, String type, Long actorId, String actorLabel, String detail, String ipAddress,
                           Instant createdAt) {}

    public record FarmerDetail(FarmerRow farmer, List<FarmRow> farms, List<PlotRow> plots, List<CycleRow> cycles,
                               List<ActivityRow> activities, List<HarvestRow> harvests, List<InputRow> inputs,
                               List<AuditRow> auditEvents) {}

    public record Telemetry(Instant generatedAt, SystemSnapshot system, TrafficSnapshot traffic) {}
}
