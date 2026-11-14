package com.farmer.tracking.modules.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ManagementOperationsDtos {

    private ManagementOperationsDtos() {}

    public record ManagedFarmRow(
            Long id,
            Long farmerId,
            String farmerName,
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
            LocalDateTime createdAt
    ) {}

    public record ManagedFarmRequest(
            @NotNull Long farmerId,
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
            LocalDateTime createdAt
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
}

