package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.Crop;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Response representing a registered crop from the farmer's personal list")
public class CropResponse {

    @Schema(description = "Unique crop ID", example = "1")
    private Long id;

    @Schema(description = "Farmer ID who owns this crop record", example = "1")
    private Long farmerId;

    @Schema(description = "Crop name", example = "Maize")
    private String name;

    @Schema(description = "Crop variety", example = "Hybrid 614")
    private String variety;

    @Schema(description = "Formatted display label combining name and variety", example = "Maize (Hybrid 614)")
    private String displayName;

    @Schema(description = "Crop category")
    private String category;

    @Schema(description = "Detailed agronomic description")
    private String description;

    @Schema(description = "Typical days from planting to harvest")
    private Integer growthDurationDays;

    @Schema(description = "Expected yield per hectare")
    private Double expectedYieldPerHectare;

    @Schema(description = "Unit for expected yield")
    private String yieldUnit;

    @Schema(description = "Recommended planting season")
    private String plantingSeason;

    @Schema(description = "Water requirement level")
    private String waterRequirement;

    @Schema(description = "Preferred soil type and pH")
    private String soilPreference;

    @Schema(description = "Photo URLs for the crop")
    private List<String> imageUrls = new ArrayList<>();

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    public CropResponse() {}

    public CropResponse(Long id, Long farmerId, String name, String variety, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.name = name;
        this.variety = variety;
        this.displayName = (variety != null && !variety.isBlank())
                ? name + " (" + variety.trim() + ")"
                : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CropResponse fromEntity(Crop crop) {
        if (crop == null) return null;
        CropResponse response = new CropResponse(
                crop.getId(),
                crop.getFarmerId(),
                crop.getName(),
                crop.getVariety(),
                crop.getCreatedAt(),
                crop.getUpdatedAt()
        );
        response.setCategory(crop.getCategory());
        response.setDescription(crop.getDescription());
        response.setGrowthDurationDays(crop.getGrowthDurationDays());
        response.setExpectedYieldPerHectare(crop.getExpectedYieldPerHectare());
        response.setYieldUnit(crop.getYieldUnit());
        response.setPlantingSeason(crop.getPlantingSeason());
        response.setWaterRequirement(crop.getWaterRequirement());
        response.setSoilPreference(crop.getSoilPreference());
        response.setImageUrls(crop.getImageUrls() != null ? new ArrayList<>(crop.getImageUrls()) : new ArrayList<>());
        return response;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getGrowthDurationDays() {
        return growthDurationDays;
    }

    public void setGrowthDurationDays(Integer growthDurationDays) {
        this.growthDurationDays = growthDurationDays;
    }

    public Double getExpectedYieldPerHectare() {
        return expectedYieldPerHectare;
    }

    public void setExpectedYieldPerHectare(Double expectedYieldPerHectare) {
        this.expectedYieldPerHectare = expectedYieldPerHectare;
    }

    public String getYieldUnit() {
        return yieldUnit;
    }

    public void setYieldUnit(String yieldUnit) {
        this.yieldUnit = yieldUnit;
    }

    public String getPlantingSeason() {
        return plantingSeason;
    }

    public void setPlantingSeason(String plantingSeason) {
        this.plantingSeason = plantingSeason;
    }

    public String getWaterRequirement() {
        return waterRequirement;
    }

    public void setWaterRequirement(String waterRequirement) {
        this.waterRequirement = waterRequirement;
    }

    public String getSoilPreference() {
        return soilPreference;
    }

    public void setSoilPreference(String soilPreference) {
        this.soilPreference = soilPreference;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }
}
