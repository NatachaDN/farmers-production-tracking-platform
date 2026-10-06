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
}
