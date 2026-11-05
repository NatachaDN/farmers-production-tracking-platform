package com.farmer.tracking.modules.input.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a farm input item (seeds, fertilizer, pesticide) in inventory.
 */
@Entity
@Table(name = "farm_inputs", indexes = {
        @Index(name = "idx_farm_inputs_farmer_id", columnList = "farmer_id")
})
public class FarmInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private InputType type;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", nullable = false)
    private Double purchasePrice;

    @Column(name = "cumulative_cost", nullable = false)
    private Double cumulativeCost;

    /**
     * Weighted-average cost of one unit of the stock currently held.
     * Recomputed on every restock; used to cost consumption on crop cycles.
     */
    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FarmInput() {}

    public FarmInput(Long farmerId, String name, InputType type, Double quantity, String unit, LocalDate purchaseDate, Double purchasePrice, Double cumulativeCost) {
        this.farmerId = farmerId;
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
        this.cumulativeCost = cumulativeCost;
        this.unitCost = (quantity != null && quantity > 0 && purchasePrice != null)
                ? purchasePrice / quantity
                : 0.0;
    }

    /**
     * Adds a new purchase to the stock and updates the weighted-average unit cost.
     *
     * @param addedQuantity quantity purchased
     * @param totalPrice    total amount paid for that quantity
     */
    public void addStock(double addedQuantity, double totalPrice) {
        double currentQuantity = quantity != null ? quantity : 0.0;
        if (currentQuantity > 0 && unitCost == null) {
            throw new com.farmer.tracking.common.exception.ConflictException("Confirm the unit cost of this existing stock before restocking.");
        }
        double currentValue = currentQuantity > 0 ? currentQuantity * unitCost : 0.0;
        this.quantity = currentQuantity + addedQuantity;
        this.unitCost = this.quantity > 0 ? (currentValue + totalPrice) / this.quantity : 0.0;
        this.cumulativeCost = (cumulativeCost != null ? cumulativeCost : 0.0) + totalPrice;
        this.purchasePrice = totalPrice;
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

    // --- Getters and Setters ---

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public InputType getType() {
        return type;
    }

    public void setType(InputType type) {
        this.type = type;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getUnitCost() {
        // Historic purchase expenditure divided by remaining quantity is not a stock valuation.
        // Null explicitly means that the farmer must confirm the legacy unit cost.
        return unitCost;
    }

    public void setUnitCost(Double unitCost) {
        this.unitCost = unitCost;
    }

    public Double getCumulativeCost() {
        return cumulativeCost;
    }

    public void setCumulativeCost(Double cumulativeCost) {
        this.cumulativeCost = cumulativeCost;
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
