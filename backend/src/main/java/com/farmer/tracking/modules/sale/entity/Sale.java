package com.farmer.tracking.modules.sale.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a harvest sale recorded by a farmer for a production cycle.
 * Used to calculate margin (sales revenue minus associated expenses).
 */
@Entity
@Table(name = "sales", indexes = {
        @Index(name = "idx_sales_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_sales_cycle_id", columnList = "cycle_id"),
        @Index(name = "idx_sales_date", columnList = "sale_date")
})
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "harvest_id")
    private Long harvestId;

    @Column(name = "quantity_sold", nullable = false)
    private BigDecimal quantitySold;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(name = "price_per_unit", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "total_revenue", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRevenue;

    @Column(nullable = false, length = 200)
    private String buyer;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Sale() {}

    public Sale(Long farmerId, Long cycleId, Long harvestId, BigDecimal quantitySold,
                String unit, BigDecimal pricePerUnit, BigDecimal totalRevenue,
                String buyer, LocalDate saleDate, String notes) {
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
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
