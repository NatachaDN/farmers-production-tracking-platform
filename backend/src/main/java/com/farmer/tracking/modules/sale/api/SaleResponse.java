package com.farmer.tracking.modules.sale.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SaleResponse {

    private Long id;
    private Long farmerId;
    private Long cycleId;
    private Long harvestId;
    private BigDecimal quantitySold;
    private String unit;
    private BigDecimal pricePerUnit;
    private BigDecimal totalRevenue;
    private String buyer;
    private LocalDate saleDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SaleResponse() {}

    public SaleResponse(Long id, Long farmerId, Long cycleId, Long harvestId,
                        BigDecimal quantitySold, String unit, BigDecimal pricePerUnit,
                        BigDecimal totalRevenue, String buyer, LocalDate saleDate,
                        String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.cycleId = cycleId;
        this.harvestId = harvestId;
        this.quantitySold = quantitySold;
        this.unit = unit;
        this.pricePerUnit = pricePerUnit;
        this.totalRevenue = totalRevenue;
        this.buyer = buyer;
        this.saleDate = saleDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SaleResponse fromEntity(com.farmer.tracking.modules.sale.entity.Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getFarmerId(),
                sale.getCycleId(),
                sale.getHarvestId(),
                sale.getQuantitySold(),
                sale.getUnit(),
                sale.getPricePerUnit(),
                sale.getTotalRevenue(),
                sale.getBuyer(),
                sale.getSaleDate(),
                sale.getNotes(),
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

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

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public String getBuyer() { return buyer; }
    public void setBuyer(String buyer) { this.buyer = buyer; }

    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
