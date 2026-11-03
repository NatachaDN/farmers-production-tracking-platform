package com.farmer.tracking.modules.farm.dto;

import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.farm.model.*;
import jakarta.validation.constraints.*;

public class UpdateFarmRequest {

    @NotBlank(message = "Farm name is required")
    @Size(max = 120, message = "Farm name cannot exceed 120 characters")
    private String name;

    @NotNull(message = "Farm type is required")
    private FarmType type;

    @NotNull(message = "Farm size is required")
    @Positive(message = "Farm size must be a positive value")
    private Double size;

    @NotNull(message = "Size unit is required")
    private SizeUnit sizeUnit;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Farm status is required")
    private FarmStatus status;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country cannot exceed 100 characters")
    private String country;

    @NotBlank(message = "Region is required")
    @Size(max = 100, message = "Region cannot exceed 100 characters")
    private String region;

    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District cannot exceed 100 characters")
    private String district;

    @Size(max = 500, message = "Map image URL cannot exceed 500 characters")
    private String mapImageUrl;

    private SoilType soilType;
    private SlopeType slope;
    private AccessToWater accessToWater;

    @Size(max = 500, message = "Additional notes cannot exceed 500 characters")
    private String additionalNotes;

    public UpdateFarmRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public FarmType getType() {
        return type;
    }

    public void setType(FarmType type) {
        this.type = type;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public SizeUnit getSizeUnit() {
        return sizeUnit;
    }

    public void setSizeUnit(SizeUnit sizeUnit) {
        this.sizeUnit = sizeUnit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FarmStatus getStatus() {
        return status;
    }

    public void setStatus(FarmStatus status) {
        this.status = status;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getMapImageUrl() {
        return mapImageUrl;
    }

    public void setMapImageUrl(String mapImageUrl) {
        this.mapImageUrl = mapImageUrl;
    }

    public SoilType getSoilType() {
        return soilType;
    }

    public void setSoilType(SoilType soilType) {
        this.soilType = soilType;
    }

    public SlopeType getSlope() {
        return slope;
    }

    public void setSlope(SlopeType slope) {
        this.slope = slope;
    }

    public AccessToWater getAccessToWater() {
        return accessToWater;
    }

    public void setAccessToWater(AccessToWater accessToWater) {
        this.accessToWater = accessToWater;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
}
