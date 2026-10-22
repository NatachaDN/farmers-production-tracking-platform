package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Represents a crop production cycle output")
public class CycleResponse {

    @Schema(description = "Unique cycle identifier", example = "1")
    private Long id;

    @Schema(description = "Farmer ID", example = "1")
    private Long farmerId;

    @Schema(description = "Associated Plot ID", example = "2")
    private Long plotId;

    @Schema(description = "Name of the plot", example = "Plot A")
    private String plotName;

    @Schema(description = "Crop grown in cycle", example = "Maize")
    private String cropName;

    @Schema(description = "Cycle display name", example = "Maize — Plot A")
    private String name;

    @Schema(description = "Cycle lifecycle status", example = "ACTIVE")
    private CycleStatus status;

    @Schema(description = "Cultivated acreage in hectares", example = "2.5")
    private Double acreage;

    @Schema(description = "Planting date", example = "2026-10-10")
    private LocalDate plantingDate;

    @Schema(description = "Planned / expected harvest date", example = "2027-02-15")
    private LocalDate plannedHarvestDate;

    @Schema(description = "Target expected production quantity", example = "5000.0")
    private Double expectedQuantity;

    @Schema(description = "Unit for expected quantity", example = "kg")
    private String expectedQuantityUnit;

    @Schema(description = "Growth stage", example = "Planting")
    private String stage;

    @Schema(description = "Cycle progress percentage (0 - 100)", example = "62")
    private Integer progress;

    @Schema(description = "Status subtext / health summary", example = "On track")
    private String subStatus;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    public CycleResponse() {}

    public static CycleResponse fromEntity(Cycle cycle) {
        CycleResponse resp = new CycleResponse();
        resp.setId(cycle.getId());
        resp.setFarmerId(cycle.getFarmerId());
        if (cycle.getPlot() != null) {
            resp.setPlotId(cycle.getPlot().getId());
            resp.setPlotName(cycle.getPlot().getName());
        }
        resp.setCropName(cycle.getCropName());
        resp.setName(cycle.getName());
        resp.setStatus(cycle.getStatus());
        resp.setAcreage(cycle.getAcreage());
        resp.setPlantingDate(cycle.getStartDate());
        resp.setPlannedHarvestDate(cycle.getEndDate());
        resp.setExpectedQuantity(cycle.getExpectedQuantity());
        resp.setExpectedQuantityUnit(cycle.getExpectedQuantityUnit());
        resp.setStage(cycle.getStage());
        resp.setProgress(cycle.getProgress());
        resp.setSubStatus(cycle.getSubStatus());
        resp.setCreatedAt(cycle.getCreatedAt());
        resp.setUpdatedAt(cycle.getUpdatedAt());
        return resp;
    }

    // --- Getters & Setters ---

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

    public Long getPlotId() {
        return plotId;
    }

    public void setPlotId(Long plotId) {
        this.plotId = plotId;
    }

    public String getPlotName() {
        return plotName;
    }

    public void setPlotName(String plotName) {
        this.plotName = plotName;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CycleStatus getStatus() {
        return status;
    }

    public void setStatus(CycleStatus status) {
        this.status = status;
    }

    public Double getAcreage() {
        return acreage;
    }

    public void setAcreage(Double acreage) {
        this.acreage = acreage;
    }

    public LocalDate getPlantingDate() {
        return plantingDate;
    }

    public void setPlantingDate(LocalDate plantingDate) {
        this.plantingDate = plantingDate;
    }

    public LocalDate getPlannedHarvestDate() {
        return plannedHarvestDate;
    }

    public void setPlannedHarvestDate(LocalDate plannedHarvestDate) {
        this.plannedHarvestDate = plannedHarvestDate;
    }

    public Double getExpectedQuantity() {
        return expectedQuantity;
    }

    public void setExpectedQuantity(Double expectedQuantity) {
        this.expectedQuantity = expectedQuantity;
    }

    public String getExpectedQuantityUnit() {
        return expectedQuantityUnit;
    }

    public void setExpectedQuantityUnit(String expectedQuantityUnit) {
        this.expectedQuantityUnit = expectedQuantityUnit;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getSubStatus() {
        return subStatus;
    }

    public void setSubStatus(String subStatus) {
        this.subStatus = subStatus;
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
