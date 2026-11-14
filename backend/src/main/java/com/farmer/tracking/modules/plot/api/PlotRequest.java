package com.farmer.tracking.modules.plot.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public class PlotRequest {

    @NotBlank(message = "Plot name is required")
    private String name;

    @NotNull(message = "Area is required")
    @Positive(message = "Area must be a positive number")
    private Double area;

    @NotBlank(message = "Location is required")
    private String location;

    private String cropType;

    private String stage;

    private Long farmId;

    private String soilType;

    private String irrigationType;

    private String slope;

    private String notes;

    private Long animalGroupId;

    private String animalGroupName;

    private List<String> imageUrls;

    public PlotRequest() {}

    public PlotRequest(String name, Double area, String location) {
        this.name = name;
        this.area = area;
        this.location = location;
    }

    public PlotRequest(String name, Double area, String location, String cropType, String stage) {
        this.name = name;
        this.area = area;
        this.location = location;
        this.cropType = cropType;
        this.stage = stage;
    }

    public PlotRequest(String name, Double area, String location, String cropType, String stage, Long farmId) {
        this.name = name;
        this.area = area;
        this.location = location;
        this.cropType = cropType;
        this.stage = stage;
        this.farmId = farmId;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getIrrigationType() {
        return irrigationType;
    }

    public void setIrrigationType(String irrigationType) {
        this.irrigationType = irrigationType;
    }

    public String getSlope() {
        return slope;
    }

    public void setSlope(String slope) {
        this.slope = slope;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public Long getAnimalGroupId() {
        return animalGroupId;
    }

    public void setAnimalGroupId(Long animalGroupId) {
        this.animalGroupId = animalGroupId;
    }

    public String getAnimalGroupName() {
        return animalGroupName;
    }

    public void setAnimalGroupName(String animalGroupName) {
        this.animalGroupName = animalGroupName;
    }
}
