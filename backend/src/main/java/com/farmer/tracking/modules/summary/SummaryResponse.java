package com.farmer.tracking.modules.summary;

import java.time.LocalDate;
import java.util.List;

/** Crop records only: kilograms and bags are deliberately separate dimensions. */
public record SummaryResponse(int farmCount, int plotCount, double plotAreaHa, long activeCycles,
        long activeCrops, double harvestedKg, double harvestedBags, int harvestCount,
        Double totalInputCost, boolean costVerified, long unverifiedInputCount,
        List<Activity> recentActivities, List<PlannedHarvest> upcomingHarvests,
        List<MonthlyHarvest> monthlyHarvests, List<CropArea> cropAreas) {
    public record Activity(Long id, Long cycleId, String cycleName, String type, LocalDate date, String notes) {}
    public record PlannedHarvest(Long cycleId, String cycleName, LocalDate date) {}
    public record MonthlyHarvest(String month, double kg, double bags) {}
    public record CropArea(String crop, double areaHa) {}
}
