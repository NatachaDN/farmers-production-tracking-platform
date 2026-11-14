package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for recording a harvest at the end of a cycle.
 */
public class HarvestRequest {

    @NotNull(message = "Harvested quantity is required")
    @Positive(message = "Harvested quantity must be greater than zero")
    private Double quantity;

    @NotNull(message = "Unit of measure is required")
    private HarvestUnit unit;

    @NotNull(message = "Harvest date is required")
    @PastOrPresent(message = "Harvest date cannot be in the future")
    private LocalDate harvestDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Size(max = 40, message = "Quality grade must not exceed 40 characters")
    private String qualityGrade;

    @Size(max = 60, message = "Harvest method must not exceed 60 characters")
    private String harvestMethod;

    @Size(max = 140, message = "Storage location must not exceed 140 characters")
    private String storageLocation;

    private Double moistureContentPercent;

    private Double postHarvestLossQuantity;

    @Size(max = 120, message = "Market destination must not exceed 120 characters")
    private String marketDestination;

    private Double estimatedRevenue;

    public HarvestRequest() {
    }

    public HarvestRequest(Double quantity, HarvestUnit unit, LocalDate harvestDate, String notes) {
        this.quantity = quantity;
        this.unit = unit;
        this.harvestDate = harvestDate;
        this.notes = notes;
    }

    // --- Getters and Setters ---

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public HarvestUnit getUnit() {
        return unit;
    }

    public void setUnit(HarvestUnit unit) {
        this.unit = unit;
    }

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public void setHarvestDate(LocalDate harvestDate) {
        this.harvestDate = harvestDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getQualityGrade() {
        return qualityGrade;
    }

    public void setQualityGrade(String qualityGrade) {
        this.qualityGrade = qualityGrade;
    }

    public String getHarvestMethod() {
        return harvestMethod;
    }

    public void setHarvestMethod(String harvestMethod) {
        this.harvestMethod = harvestMethod;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public Double getMoistureContentPercent() {
        return moistureContentPercent;
    }

    public void setMoistureContentPercent(Double moistureContentPercent) {
        this.moistureContentPercent = moistureContentPercent;
    }

    public Double getPostHarvestLossQuantity() {
        return postHarvestLossQuantity;
    }

    public void setPostHarvestLossQuantity(Double postHarvestLossQuantity) {
        this.postHarvestLossQuantity = postHarvestLossQuantity;
    }

    public String getMarketDestination() {
        return marketDestination;
    }

    public void setMarketDestination(String marketDestination) {
        this.marketDestination = marketDestination;
    }

    public Double getEstimatedRevenue() {
        return estimatedRevenue;
    }

    public void setEstimatedRevenue(Double estimatedRevenue) {
        this.estimatedRevenue = estimatedRevenue;
    }
}
