package com.farmer.tracking.modules.plot.api;

import com.farmer.tracking.modules.plot.entity.Plot;

import java.time.LocalDateTime;

public class PlotResponse {

    private Long id;
    private Long farmerId;
    private String name;
    private Double area;
    private String location;
    private String cropType;
    private String stage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PlotResponse() {}

    public PlotResponse(Long id, Long farmerId, String name, Double area, String location, String cropType, String stage, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.name = name;
        this.area = area;
        this.location = location;
        this.cropType = cropType;
        this.stage = stage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static PlotResponse fromEntity(Plot plot) {
        return new PlotResponse(
                plot.getId(),
                plot.getFarmerId(),
                plot.getName(),
                plot.getArea(),
                plot.getLocation(),
                plot.getCropType(),
                plot.getStage(),
                plot.getCreatedAt(),
                plot.getUpdatedAt()
        );
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
}
