package com.farmer.tracking.modules.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ManagementOperationsDtos {

    private ManagementOperationsDtos() {}

    public record RelatedPersonSummary(Long id, String fullName, String emailOrPhone, String role) {}
    public record RelatedPlotSummary(Long id, String name, Double area, String location, String cropType, String stage, Long farmId, String farmName) {}
    public record RelatedCropSummary(Long id, String name, String variety, String category) {}
    public record RelatedAnimalGroupSummary(Long id, String name, String animalType, Integer currentPopulation, String status) {}
    public record RelatedFarmSummary(Long id, String name, String type, String region) {}

    public record ManagedFarmRow(
            Long id,
            Long farmerId,
            String farmerName,
            Long managerId,
            String managerName,
            String name,
            String type,
            Double size,
            String sizeUnit,
            String status,
            String country,
            String region,
            String district,
            String description,
            int plotCount,
            LocalDateTime createdAt,
            List<RelatedPersonSummary> farmers,
            List<RelatedPersonSummary> managers,
            List<RelatedPlotSummary> plots,
            List<RelatedCropSummary> crops,
            List<RelatedAnimalGroupSummary> animalGroups
    ) {}

    public record ManagedFarmRequest(
            @NotNull Long farmerId,
            Long managerId,
            @NotBlank String name,
            String type,
            @NotNull Double size,
            String sizeUnit,
            String status,
            String country,
            String region,
            String district,
            String description
    ) {}

    public record ManagedPlotRow(
            Long id,
            Long farmerId,
            String farmerName,
            Long farmId,
            String farmName,
            String name,
            Double area,
            String location,
            String cropType,
            String stage,
            String soilType,
            String irrigationType,
            String slope,
            String notes,
            Long animalGroupId,
            String animalGroupName,
            LocalDateTime createdAt
    ) {}

    public record ManagedPlotRequest(
            @NotNull Long farmerId,
            Long farmId,
            @NotBlank String name,
            @NotNull Double area,
            @NotBlank String location,
            String cropType,
            String stage,
            String soilType,
            String irrigationType,
            String slope,
            String notes,
            Long animalGroupId,
            String animalGroupName
    ) {}

    public record ManagedAnimalGroupRow(
            Long id,
            Long farmerId,
            String farmerName,
            Long farmId,
            String farmName,
            String name,
            String animalType,
            String breed,
            Integer initialPopulation,
            Integer currentPopulation,
            String location,
            String purpose,
            String status,
            String healthStatus,
            String notes,
            LocalDate startDate,
            LocalDateTime createdAt,
            List<RelatedPlotSummary> plots,
            List<RelatedFarmSummary> farms
    ) {}

    public record ManagedAnimalGroupRequest(
            @NotNull Long farmerId,
            Long farmId,
            @NotBlank String name,
            String animalType,
            String breed,
            Integer initialPopulation,
            Integer currentPopulation,
            String location,
            String purpose,
            String status,
            String healthStatus,
            String notes,
            LocalDate startDate
    ) {}

    public record ManagedIncidentRow(
            Long id,
            String kind,
            Long farmerId,
            String farmerName,
            String targetName,
            String incidentType,
            LocalDate incidentDate,
            Integer severityLevel,
            Integer affectedCount,
            String description,
            String actionTaken,
            String status,
            String resolvedBy,
            LocalDateTime resolvedAt,
            LocalDateTime createdAt
    ) {}

    public record IncidentActionRequest(
            @NotBlank String status,
            @NotBlank String actionTaken,
            boolean notifyFarmer,
            String notificationMessage
    ) {}

    // ── Crops Management ──

    public record ManagedCropRow(
            Long id,
            Long farmerId,
            String farmerName,
            String name,
            String variety,
            String category,
            Integer growthDurationDays,
            Double expectedYieldPerHectare,
            String yieldUnit,
            String plantingSeason,
            String waterRequirement,
            String soilPreference,
            String description,
            LocalDateTime createdAt,
            List<RelatedPlotSummary> plots,
            List<RelatedFarmSummary> farms
    ) {}

    public record ManagedCropRequest(
            @NotNull Long farmerId,
            @NotBlank String name,
            String variety,
            String category,
            Integer growthDurationDays,
            Double expectedYieldPerHectare,
            String yieldUnit,
            String plantingSeason,
            String waterRequirement,
            String soilPreference,
            String description
    ) {}

    // ── Harvests Management ──

    public record ManagedHarvestRow(
            Long id,
            Long cycleId,
            String cycleName,
            String cropName,
            Long farmerId,
            String farmerName,
            Double quantity,
            String unit,
            LocalDate harvestDate,
            Double calculatedYield,
            String qualityGrade,
            String marketDestination,
            Double estimatedRevenue,
            String notes,
            LocalDateTime createdAt
    ) {}

    public record ManagedHarvestRequest(
            @NotNull Long cycleId,
            @NotNull Double quantity,
            String unit,
            LocalDate harvestDate,
            String qualityGrade,
            String marketDestination,
            Double estimatedRevenue,
            String notes
    ) {}

    public record SimpleCycleOption(
            Long id,
            String name,
            String cropName,
            Long farmerId,
            String farmerName
    ) {}

    // ── Inputs Management ──

    public record ManagedInputRow(
            Long id,
            Long farmerId,
            String farmerName,
            String name,
            String type,
            Double quantity,
            String unit,
            LocalDate purchaseDate,
            Double purchasePrice,
            Double cumulativeCost,
            String brand,
            String supplier,
            String storageLocation,
            String description,
            LocalDateTime createdAt
    ) {}

    public record ManagedInputRequest(
            @NotNull Long farmerId,
            @NotBlank String name,
            String type,
            @NotNull Double quantity,
            @NotBlank String unit,
            LocalDate purchaseDate,
            @NotNull Double purchasePrice,
            Double cumulativeCost,
            String brand,
            String supplier,
            String storageLocation,
            String description
    ) {}
}

