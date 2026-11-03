package com.farmer.tracking.modules.sale.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SaleRequest {

    @NotNull(message = "Cycle ID is required")
    private Long cycleId;

    private Long harvestId;

    @NotNull(message = "Quantity sold is required")
    @Positive(message = "Quantity sold must be a positive number")
    private BigDecimal quantitySold;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Price per unit is required")
    @Positive(message = "Price per unit must be a positive number")
    private BigDecimal pricePerUnit;

    @NotBlank(message = "Buyer is required")
    private String buyer;

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @NotBlank(message = "Notes must not exceed 1000 characters")
    private String notes = "";

    public SaleRequest() {}

    public SaleRequest(Long cycleId, Long harvestId, BigDecimal quantitySold, String unit,
                       BigDecimal pricePerUnit, String buyer, LocalDate saleDate, String notes) {
        this.cycleId = cycleId;
        this.harvestId = harvestId;
        this.quantitySold = quantitySold;
        this.unit = unit;
        this.pricePerUnit = pricePerUnit;
        this.buyer = buyer;
        this.saleDate = saleDate;
        this.notes = notes;
    }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public Long getHarvestId() { return harvestId; }
    public void setHarvestId(Long harvestId) { this.harvestId = harvestId; }

    public BigDecimal getQuantitySold() { return quantitySold; }
    public void setQuantitySold(BigDecimal quantitySold) { this.quantitySold = quantitySold; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }

    public String getBuyer() { return buyer; }
    public void setBuyer(String buyer) { this.buyer = buyer; }

    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes == null ? "" : notes; }
}
