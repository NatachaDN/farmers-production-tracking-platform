package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents the harvest output recorded for a crop cycle.
 */
@Entity
@Table(name = "harvests", indexes = {
        @Index(name = "idx_harvests_cycle_id", columnList = "cycle_id"),
        @Index(name = "idx_harvests_date", columnList = "harvest_date")
})
public class Harvest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false, unique = true)
    private Cycle cycle;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private HarvestUnit unit;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    /**
     * Calculated yield rate (e.g. quantity per hectare/acre if acreage is present).
     */
    @Column(name = "calculated_yield")
    private Double calculatedYield;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "quality_grade", length = 40)
    private String qualityGrade;

    @Column(name = "harvest_method", length = 60)
    private String harvestMethod;

    @Column(name = "storage_location", length = 140)
    private String storageLocation;

    @Column(name = "moisture_content_percent")
    private Double moistureContentPercent;

    @Column(name = "post_harvest_loss_quantity")
    private Double postHarvestLossQuantity;

    @Column(name = "market_destination", length = 120)
    private String marketDestination;

    @Column(name = "estimated_revenue")
    private Double estimatedRevenue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cycle getCycle() {
        return cycle;
    }

    public void setCycle(Cycle cycle) {
        this.cycle = cycle;
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

    public Double getCalculatedYield() {
        return calculatedYield;
    }

    public void setCalculatedYield(Double calculatedYield) {
        this.calculatedYield = calculatedYield;
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
