package com.farmer.tracking.modules.plot.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

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
}
