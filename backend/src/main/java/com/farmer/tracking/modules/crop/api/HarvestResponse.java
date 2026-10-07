package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO returned after recording or reading a harvest.
 */
public class HarvestResponse {

    private Long id;
    private Long cycleId;
    private String cycleName;
    private CycleStatus cycleStatus;
    private Double quantity;
    private HarvestUnit unit;
    private LocalDate harvestDate;
    private Double acreage;
    private Double calculatedYield;
    private String yieldDisplay;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HarvestResponse() {
    }

    public HarvestResponse(Long id, Long cycleId, String cycleName, CycleStatus cycleStatus,
                           Double quantity, HarvestUnit unit, LocalDate harvestDate,
                           Double acreage, Double calculatedYield, String yieldDisplay,
                           String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.cycleId = cycleId;
        this.cycleName = cycleName;
        this.cycleStatus = cycleStatus;
        this.quantity = quantity;
        this.unit = unit;
        this.harvestDate = harvestDate;
        this.acreage = acreage;
        this.calculatedYield = calculatedYield;
        this.yieldDisplay = yieldDisplay;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCycleId() {
        return cycleId;
    }

    public void setCycleId(Long cycleId) {
        this.cycleId = cycleId;
    }

    public String getCycleName() {
        return cycleName;
    }

    public void setCycleName(String cycleName) {
        this.cycleName = cycleName;
    }

    public CycleStatus getCycleStatus() {
        return cycleStatus;
    }

    public void setCycleStatus(CycleStatus cycleStatus) {
        this.cycleStatus = cycleStatus;
    }

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

    public Double getAcreage() {
        return acreage;
    }

    public void setAcreage(Double acreage) {
        this.acreage = acreage;
    }

    public Double getCalculatedYield() {
        return calculatedYield;
    }

    public void setCalculatedYield(Double calculatedYield) {
        this.calculatedYield = calculatedYield;
    }

    public String getYieldDisplay() {
        return yieldDisplay;
    }

    public void setYieldDisplay(String yieldDisplay) {
        this.yieldDisplay = yieldDisplay;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
