package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Payload for registering or updating a crop in the farmer's personal list")
public class CropRequest {

    @NotBlank(message = "Crop name is required")
    @Size(max = 120, message = "Crop name must not exceed 120 characters")
    @Schema(description = "Name of the crop", example = "Maize")
    private String name;

    @Size(max = 120, message = "Variety must not exceed 120 characters")
    @Schema(description = "Optional variety or cultivar of the crop", example = "Hybrid 614")
    private String variety;

    @Size(max = 60, message = "Category must not exceed 60 characters")
    @Schema(description = "Crop category (e.g. Cereals, Legumes, Vegetables, Roots & Tubers)", example = "Cereals")
    private String category;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Schema(description = "Detailed agronomic description, growing notes, and characteristics")
    private String description;

    @Min(value = 1, message = "Growth duration must be at least 1 day")
    @Schema(description = "Typical days from planting to harvest", example = "120")
    private Integer growthDurationDays;

    @DecimalMin(value = "0.0", inclusive = true, message = "Expected yield must be non-negative")
    @Schema(description = "Expected yield per hectare", example = "4500")
    private Double expectedYieldPerHectare;

    @Size(max = 20, message = "Yield unit must not exceed 20 characters")
    @Schema(description = "Unit for expected yield", example = "kg/ha")
    private String yieldUnit;

    @Size(max = 120, message = "Planting season must not exceed 120 characters")
    @Schema(description = "Recommended planting season", example = "Long Rains (Mar–May)")
    private String plantingSeason;

    @Size(max = 40, message = "Water requirement must not exceed 40 characters")
    @Schema(description = "Water requirement level (Low, Moderate, High)", example = "Moderate")
    private String waterRequirement;

    @Size(max = 160, message = "Soil preference must not exceed 160 characters")
    @Schema(description = "Preferred soil type and pH", example = "Well-drained loamy soil, pH 6.0–7.0")
    private String soilPreference;

    @Schema(description = "List of photo URLs for the crop")
    private List<String> imageUrls;

    public CropRequest() {}

    public CropRequest(String name, String variety) {
        this.name = name;
        this.variety = variety;
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
        this.imageUrls = imageUrls;
    }
}
