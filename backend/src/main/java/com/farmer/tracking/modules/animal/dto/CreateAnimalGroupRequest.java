package com.farmer.tracking.modules.animal.dto;

import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Payload to register a new animal group / livestock batch")
public class CreateAnimalGroupRequest {

    @NotBlank(message = "Group name is required")
    @Size(max = 120, message = "Group name cannot exceed 120 characters")
    @Schema(description = "Group name or herd/flock identifier", example = "Dairy Herd A")
    private String name;

    @NotNull(message = "Animal type is required")
    @Schema(description = "Animal type category", example = "CATTLE")
    private AnimalType animalType;

    @Size(max = 120, message = "Breed cannot exceed 120 characters")
    @Schema(description = "Breed designation (where applicable)", example = "Holstein Friesian")
    private String breed;

    @NotNull(message = "Initial population is required")
    @Min(value = 1, message = "Initial population must be greater than zero")
    @Schema(description = "Starting headcount (must be > 0)", example = "25")
    private Integer initialPopulation;

    @Min(value = 0, message = "Current population cannot be negative")
    @Schema(description = "Current headcount (defaults to initialPopulation if omitted)", example = "25")
    private Integer currentPopulation;

    @Size(max = 150, message = "Location/housing cannot exceed 150 characters")
    @Schema(description = "Housing, pen, coop, barn, or pasture location", example = "Barn 2 — East Meadow")
    private String location;

    @Schema(description = "Optional farm ID holding this group", example = "1")
    private Long farmId;

    @Size(max = 80, message = "Purpose cannot exceed 80 characters")
    @Schema(description = "Primary farming purpose (e.g., Milk, Meat, Eggs, Breeding)", example = "Milk Production")
    private String purpose;

    @Schema(description = "Group status (defaults to ACTIVE)", example = "ACTIVE")
    private AnimalGroupStatus status;

    @Schema(description = "Start/acquisition date (defaults to today)", example = "2026-10-15")
    private LocalDate startDate;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    @Schema(description = "Additional descriptive notes", example = "Acquired from regional cooperative")
    private String notes;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    @Schema(description = "Detailed description of the herd/flock, origin, and management notes")
    private String description;

    @Size(max = 160, message = "Feeding regime cannot exceed 160 characters")
    @Schema(description = "Feeding regime or ration", example = "Zero-grazing + Dairy meal")
    private String feedingRegime;

    @Size(max = 60, message = "Health status cannot exceed 60 characters")
    @Schema(description = "Current health status", example = "Healthy / Vaccinated")
    private String healthStatus;

    @Schema(description = "Average animal weight in kg", example = "380.0")
    private Double averageWeightKg;

    @Schema(description = "Photo URLs for the animal group")
    private List<String> imageUrls;

    public CreateAnimalGroupRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(AnimalType animalType) {
        this.animalType = animalType;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Integer getInitialPopulation() {
        return initialPopulation;
    }

    public void setInitialPopulation(Integer initialPopulation) {
        this.initialPopulation = initialPopulation;
    }

    public Integer getCurrentPopulation() {
        return currentPopulation;
    }

    public void setCurrentPopulation(Integer currentPopulation) {
        this.currentPopulation = currentPopulation;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public AnimalGroupStatus getStatus() {
        return status;
    }

    public void setStatus(AnimalGroupStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFeedingRegime() {
        return feedingRegime;
    }

    public void setFeedingRegime(String feedingRegime) {
        this.feedingRegime = feedingRegime;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public Double getAverageWeightKg() {
        return averageWeightKg;
    }

    public void setAverageWeightKg(Double averageWeightKg) {
        this.averageWeightKg = averageWeightKg;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}

