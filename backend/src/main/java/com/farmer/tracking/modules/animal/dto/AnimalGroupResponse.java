package com.farmer.tracking.modules.animal.dto;

import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Animal group details returned by the API")
public class AnimalGroupResponse {

    @Schema(description = "Unique ID of the animal group", example = "1")
    private Long id;

    @Schema(description = "ID of the owning farmer", example = "42")
    private Long farmerId;

    @Schema(description = "ID of the associated farm (if specified)", example = "3")
    private Long farmId;

    @Schema(description = "Name of the associated farm", example = "Green Acres Farm")
    private String farmName;

    @Schema(description = "Group name or herd identifier", example = "Dairy Herd A")
    private String name;

    @Schema(description = "Animal category", example = "CATTLE")
    private AnimalType animalType;

    @Schema(description = "Display label of the animal category", example = "Cattle")
    private String animalTypeDisplay;

    @Schema(description = "Breed designation", example = "Holstein Friesian")
    private String breed;

    @Schema(description = "Original starting headcount", example = "25")
    private Integer initialPopulation;

    @Schema(description = "Current live headcount", example = "25")
    private Integer currentPopulation;

    @Schema(description = "Housing or location description", example = "Barn 2 — East Meadow")
    private String location;

    @Schema(description = "Primary farming purpose", example = "Milk Production")
    private String purpose;

    @Schema(description = "Current status", example = "ACTIVE")
    private AnimalGroupStatus status;

    @Schema(description = "Acquisition or start date", example = "2026-10-15")
    private LocalDate startDate;

    @Schema(description = "Descriptive notes", example = "Healthy batch")
    private String notes;

    @Schema(description = "Detailed description of the animal group")
    private String description;

    @Schema(description = "Feeding regime or ration")
    private String feedingRegime;

    @Schema(description = "Health status")
    private String healthStatus;

    @Schema(description = "Average animal weight in kg")
    private Double averageWeightKg;

    @Schema(description = "Photo URLs for the animal group")
    private List<String> imageUrls = new ArrayList<>();

    @Schema(description = "Record creation timestamp", example = "2026-11-10T09:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2026-11-10T11:45:00")
    private LocalDateTime updatedAt;

    public AnimalGroupResponse() {}

    public static AnimalGroupResponse fromEntity(AnimalGroup group) {
        if (group == null) return null;
        AnimalGroupResponse res = new AnimalGroupResponse();
        res.setId(group.getId());
        res.setFarmerId(group.getFarmerId());
        res.setFarmId(group.getFarmId());
        res.setFarmName(group.getFarm() != null ? group.getFarm().getName() : null);
        res.setName(group.getName());
        res.setAnimalType(group.getAnimalType());
        res.setAnimalTypeDisplay(group.getAnimalType() != null ? group.getAnimalType().getDisplayName() : null);
        res.setBreed(group.getBreed());
        res.setInitialPopulation(group.getInitialPopulation());
        res.setCurrentPopulation(group.getCurrentPopulation());
        res.setLocation(group.getLocation());
        res.setPurpose(group.getPurpose());
        res.setStatus(group.getStatus());
        res.setStartDate(group.getStartDate());
        res.setNotes(group.getNotes());
        res.setDescription(group.getDescription());
        res.setFeedingRegime(group.getFeedingRegime());
        res.setHealthStatus(group.getHealthStatus());
        res.setAverageWeightKg(group.getAverageWeightKg());
        res.setImageUrls(group.getImageUrls() != null ? new ArrayList<>(group.getImageUrls()) : new ArrayList<>());
        res.setCreatedAt(group.getCreatedAt());
        res.setUpdatedAt(group.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

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

    public String getAnimalTypeDisplay() {
        return animalTypeDisplay;
    }

    public void setAnimalTypeDisplay(String animalTypeDisplay) {
        this.animalTypeDisplay = animalTypeDisplay;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }
}

