package com.farmer.tracking.modules.farm.api;

import com.farmer.tracking.modules.farm.entity.Farm;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Represents a farmer's farm details and summary")
public class FarmResponse {

    @Schema(description = "Farm ID", example = "1")
    private Long id;

    @Schema(description = "Farmer ID", example = "1")
    private Long farmerId;

    @Schema(description = "Farm Name", example = "Green Acres Farm")
    private String name;

    @Schema(description = "Location", example = "Nakuru County, Kenya")
    private String location;

    @Schema(description = "Description", example = "Main farm")
    private String description;

    @Schema(description = "Is default container for plots", example = "true")
    private Boolean isDefault;

    @Schema(description = "Total cultivated area in ha across all plots", example = "8.7")
    private Double totalArea;

    @Schema(description = "Total number of plots in this farm", example = "4")
    private Integer plotCount;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    public FarmResponse() {}

    public static FarmResponse fromEntity(Farm farm, Double totalArea, Integer plotCount) {
        FarmResponse resp = new FarmResponse();
        resp.setId(farm.getId());
        resp.setFarmerId(farm.getFarmerId());
        resp.setName(farm.getName());
        resp.setLocation(farm.getLocation());
        resp.setDescription(farm.getDescription());
        resp.setIsDefault(farm.getIsDefault());
        resp.setTotalArea(totalArea != null ? Math.round(totalArea * 100.0) / 100.0 : 0.0);
        resp.setPlotCount(plotCount != null ? plotCount : 0);
        resp.setCreatedAt(farm.getCreatedAt());
        resp.setUpdatedAt(farm.getUpdatedAt());
        return resp;
    }

    public static FarmResponse fromEntity(Farm farm) {
        double area = 0.0;
        int count = 0;
        if (farm.getPlots() != null) {
            count = farm.getPlots().size();
            area = farm.getPlots().stream()
                    .filter(p -> p.getArea() != null)
                    .mapToDouble(p -> p.getArea())
                    .sum();
        }
        return fromEntity(farm, area, count);
    }

    // --- Getters and Setters ---

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Double getTotalArea() {
        return totalArea;
    }

    public void setTotalArea(Double totalArea) {
        this.totalArea = totalArea;
    }

    public Integer getPlotCount() {
        return plotCount;
    }

    public void setPlotCount(Integer plotCount) {
        this.plotCount = plotCount;
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
