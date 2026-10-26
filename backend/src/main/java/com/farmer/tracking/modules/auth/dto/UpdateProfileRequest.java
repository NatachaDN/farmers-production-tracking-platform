package com.farmer.tracking.modules.auth.dto;

import com.farmer.tracking.modules.auth.model.FarmType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for updating a farmer's profile information")
public class UpdateProfileRequest {

    @Size(max = 120, message = "Full name cannot exceed 120 characters")
    @Schema(description = "Farmer full name", example = "Joyce Muthoni")
    private String fullName;

    @Size(max = 120, message = "Farm name cannot exceed 120 characters")
    @Schema(description = "Farm name", example = "Green Acres Farm")
    private String farmName;

    @Size(max = 255, message = "Crops grown cannot exceed 255 characters")
    @Schema(description = "List or description of crops grown", example = "Maize, Tomatoes, Beans, Cassava")
    private String cropsGrown;

    @DecimalMin(value = "0.0", message = "Total area cannot be negative")
    @Schema(description = "Total cultivated or holding area in hectares", example = "8.7")
    private Double totalArea;

    @Size(max = 1024, message = "Photo URL cannot exceed 1024 characters")
    @Schema(description = "Farmer photo or avatar URL", example = "https://images.unsplash.com/photo-farmer.jpg")
    private String avatarUrl;

    @Size(max = 180, message = "Location cannot exceed 180 characters")
    @Schema(description = "Farmer farm location or county", example = "Nakuru County, Kenya")
    private String location;

    @Schema(description = "Primary farming category", example = "MIXED")
    private FarmType farmType;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String fullName, String farmName, String cropsGrown, Double totalArea, String avatarUrl, String location, FarmType farmType) {
        this.fullName = fullName;
        this.farmName = farmName;
        this.cropsGrown = cropsGrown;
        this.totalArea = totalArea;
        this.avatarUrl = avatarUrl;
        this.location = location;
        this.farmType = farmType;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getCropsGrown() {
        return cropsGrown;
    }

    public void setCropsGrown(String cropsGrown) {
        this.cropsGrown = cropsGrown;
    }

    public Double getTotalArea() {
        return totalArea;
    }

    public void setTotalArea(Double totalArea) {
        this.totalArea = totalArea;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public FarmType getFarmType() {
        return farmType;
    }

    public void setFarmType(FarmType farmType) {
        this.farmType = farmType;
    }
}
