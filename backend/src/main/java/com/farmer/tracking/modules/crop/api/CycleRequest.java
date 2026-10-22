package com.farmer.tracking.modules.crop.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Schema(description = "Payload for creating a new crop production cycle")
public class CycleRequest {

    @NotNull(message = "Plot ID is required")
    @Schema(description = "ID of the plot where crop will be planted", example = "1")
    private Long plotId;

    @NotBlank(message = "Crop name is required")
    @Schema(description = "Crop to be grown", example = "Maize")
    private String cropName;

    @Schema(description = "Optional cycle name. If omitted, will default to '{cropName} — {plotName}'", example = "Maize 2026 - Season A")
    private String name;

    @NotNull(message = "Planting date is required")
    @Schema(description = "Planting date of the cycle", example = "2026-10-10")
    private LocalDate plantingDate;

    @Schema(description = "Planned harvest date", example = "2027-02-15")
    private LocalDate plannedHarvestDate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Expected quantity must be greater than 0")
    @Schema(description = "Target / expected output quantity to be compared against actual harvest", example = "5000.0")
    private Double expectedQuantity;

    @Schema(description = "Unit of measurement for expected quantity (e.g. kg, t, bags)", example = "kg")
    private String expectedQuantityUnit = "kg";

    @Schema(description = "Cultivated acreage / area in hectares (defaults to plot area if not provided)", example = "2.5")
    private Double acreage;

    @Schema(description = "Current growth stage", example = "Planting")
    private String stage;

    @Schema(description = "If true, bypasses plot active conflict warning and confirms overlapping cycle creation", example = "false")
    private Boolean allowConflict = false;

    public CycleRequest() {}

    public CycleRequest(Long plotId, String cropName, String name, LocalDate plantingDate, LocalDate plannedHarvestDate, Double expectedQuantity, String expectedQuantityUnit, Double acreage) {
        this.plotId = plotId;
        this.cropName = cropName;
        this.name = name;
        this.plantingDate = plantingDate;
        this.plannedHarvestDate = plannedHarvestDate;
        this.expectedQuantity = expectedQuantity;
        this.expectedQuantityUnit = expectedQuantityUnit;
        this.acreage = acreage;
    }

    // --- Getters & Setters ---

    public Long getPlotId() {
        return plotId;
    }

    public void setPlotId(Long plotId) {
        this.plotId = plotId;
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

    public Double getAcreage() {
        return acreage;
    }

    public void setAcreage(Double acreage) {
        this.acreage = acreage;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Boolean getAllowConflict() {
        return allowConflict;
    }

    public void setAllowConflict(Boolean allowConflict) {
        this.allowConflict = allowConflict;
    }
}
