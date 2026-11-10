package com.farmer.tracking.modules.dashboard.api;

import java.time.LocalDate;
import java.util.List;

public record FarmerDashboardResponse(
        String farmerName,
        String farmName,
        int activeCyclesCount,
        int completedCyclesCount,
        int totalCyclesCount,
        int plotsCount,
        double totalAreaHa,
        int farmsCount,
        double totalHarvestKg,
        int harvestCount,
        int totalInputsCount,
        double totalInputsCost,
        int activitiesCount,
        List<RecentActivityItem> recentActivities,
        List<UpcomingActivityItem> upcomingActivities,
        List<MonthlyProductionItem> monthlyProduction
) {
    public record RecentActivityItem(
            Long id,
            Long cycleId,
            String cycleName,
            String cropName,
            String plotName,
            String activityType,
            LocalDate activityDate,
            String notes
    ) {}

    public record UpcomingActivityItem(
            Long id,
            String title,
            String location,
            String dateOrTime,
            String type
    ) {}

    public record MonthlyProductionItem(
            String month,
            double quantityKg
    ) {}
}

