package com.farmer.tracking.modules.manager.dto;

import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ManagerDtos {

    public record ManagerDashboardSummary(
            long totalFarmers,
            long pendingFarmers,
            long approvedFarmers,
            long rejectedFarmers,
            int activeCyclesCount,
            int completedCyclesCount,
            double totalHarvestKg,
            double totalHarvestTons,
            double totalCultivatedAreaHa,
            int totalPlotsCount,
            int totalAnimalGroupsCount,
            long totalAnimalPopulation,
            int activeAlertsCount,
            List<ManagerAlertRow> recentAlerts,
            List<TopProducerRow> topProducers,
            List<MonthlyProductionItem> monthlyProduction,
            List<ManagerFarmerRow> pendingRegistrations
    ) {}

    public record ManagerAlertRow(
            Long id,
            Long farmerId,
            String farmerName,
            String farmName,
            String plotName,
            String cycleName,
            String incidentType,
            Integer severityLevel,
            LocalDate incidentDate,
            String description,
            String actionTaken
    ) {}

    public record TopProducerRow(
            Long farmerId,
            String farmerName,
            String location,
            String farmName,
            double totalYieldKg,
            double totalYieldTons,
            int activeCycles,
            int plotsCount
    ) {}

    public record MonthlyProductionItem(
            String month,
            double yieldKg
    ) {}

    public record ManagerFarmerRow(
            Long id,
            String fullName,
            String emailOrPhone,
            String location,
            String region,
            String farmName,
            FarmType farmType,
            List<String> cropsGrown,
            int plotsCount,
            int activeCycles,
            int totalCycles,
            double harvestedKg,
            double harvestedTons,
            RegistrationStatus status,
            String rejectionReason,
            LocalDateTime joinedAt,
            LocalDateTime lastLoginAt
    ) {}

    public record ManagerFarmerDetail(
            ManagerFarmerRow farmer,
            List<FarmerFarmItem> farms,
            List<FarmerPlotItem> plots,
            List<FarmerCycleItem> cycles,
            List<FarmerHarvestItem> harvests,
            List<ManagerAlertRow> incidents,
            List<FarmerAnimalGroupItem> animalGroups
    ) {}

    public record FarmerFarmItem(
            Long id,
            String name,
            String type,
            Double size,
            String sizeUnit,
            String region,
            String district,
            String status
    ) {}

    public record FarmerPlotItem(
            Long id,
            String name,
            Double area,
            String location,
            String cropType,
            String stage
    ) {}

    public record FarmerCycleItem(
            Long id,
            String name,
            String cropName,
            String plotName,
            String status,
            LocalDate startDate,
            LocalDate endDate,
            Double acreage
    ) {}

    public record FarmerHarvestItem(
            Long id,
            Long cycleId,
            String cropName,
            Double quantityKg,
            LocalDate harvestDate,
            String qualityGrade
    ) {}

    public record FarmerAnimalGroupItem(
            Long id,
            String name,
            String animalType,
            String breed,
            Integer currentPopulation,
            String location,
            String status
    ) {}

    public static class UpdateFarmerStatusRequest {
        @NotNull(message = "Registration status is required")
        private RegistrationStatus status;
        private String rejectionReason;

        public UpdateFarmerStatusRequest() {}

        public UpdateFarmerStatusRequest(RegistrationStatus status, String rejectionReason) {
            this.status = status;
            this.rejectionReason = rejectionReason;
        }

        public RegistrationStatus getStatus() {
            return status;
        }

        public void setStatus(RegistrationStatus status) {
            this.status = status;
        }

        public String getRejectionReason() {
            return rejectionReason;
        }

        public void setRejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
        }
    }

    public static class ConsolidatedReportRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private List<Long> farmerIds;
        private String region;
        private String crop;

        public ConsolidatedReportRequest() {}

        public ConsolidatedReportRequest(LocalDate startDate, LocalDate endDate, List<Long> farmerIds, String region, String crop) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.farmerIds = farmerIds;
            this.region = region;
            this.crop = crop;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public List<Long> getFarmerIds() {
            return farmerIds;
        }

        public void setFarmerIds(List<Long> farmerIds) {
            this.farmerIds = farmerIds;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }

        public String getCrop() {
            return crop;
        }

        public void setCrop(String crop) {
            this.crop = crop;
        }
    }

    public record ConsolidatedReportResponse(
            String reportId,
            LocalDateTime generatedAt,
            LocalDate startDate,
            LocalDate endDate,
            int totalFarmersCount,
            double totalYieldKg,
            double totalYieldTons,
            int totalActiveCycles,
            int totalCompletedCycles,
            int totalPlotsCount,
            double totalCultivatedAreaHa,
            int totalIncidentsCount,
            double totalInputsCost,
            List<CropConsolidatedRow> cropBreakdown,
            List<FarmerConsolidatedRow> farmerBreakdown
    ) {}

    public record CropConsolidatedRow(
            String cropName,
            double yieldKg,
            double yieldTons,
            int cyclesCount,
            double sharePercent
    ) {}

    public record FarmerConsolidatedRow(
            Long farmerId,
            String farmerName,
            String location,
            String region,
            String farmName,
            int plotsCount,
            int activeCycles,
            int completedCycles,
            double harvestedKg,
            double harvestedTons,
            List<String> crops
    ) {}
}
