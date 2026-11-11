package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/** Snapshot copied before an edit; never references the mutable harvest values. */
@Embeddable
public class HarvestValues {
    private Double quantity;
    @Enumerated(EnumType.STRING) private HarvestUnit unit;
    private LocalDate harvestDate;
    @Column(length = 1000) private String notes;
    private Double calculatedYield;
    protected HarvestValues() {}
    public HarvestValues(Harvest harvest) {
        quantity = harvest.getQuantity(); unit = harvest.getUnit(); harvestDate = harvest.getHarvestDate();
        notes = harvest.getNotes(); calculatedYield = harvest.getCalculatedYield();
    }
    public Double getQuantity() { return quantity; }
    public HarvestUnit getUnit() { return unit; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public String getNotes() { return notes; }
    public Double getCalculatedYield() { return calculatedYield; }
}
