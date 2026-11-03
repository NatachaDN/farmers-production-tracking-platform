package com.farmer.tracking.modules.crop.entity;

import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an input item (seeds, fertilizer, pesticide) consumed on a specific crop production cycle.
 * <p>
 * Recording an input usage links consumption to the cycle, calculates its real financial cost,
 * and deducts the used quantity from the inventory's available stock.
 * </p>
 */
@Entity
@Table(name = "cycle_input_usages", indexes = {
        @Index(name = "idx_cycle_input_usages_cycle_id", columnList = "cycle_id"),
        @Index(name = "idx_cycle_input_usages_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_cycle_input_usages_input_id", columnList = "input_id"),
        @Index(name = "idx_cycle_input_usages_date", columnList = "usage_date")
})
public class CycleInputUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private Cycle cycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "input_id", nullable = false)
    private FarmInput farmInput;

    @Column(name = "input_name", nullable = false, length = 120)
    private String inputName;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type", nullable = false, length = 40)
    private InputType inputType;

    @Column(name = "quantity_used", nullable = false)
    private Double quantityUsed;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CycleInputUsage() {}

    public CycleInputUsage(Long farmerId, Cycle cycle, FarmInput farmInput, String inputName,
                           InputType inputType, Double quantityUsed, String unit,
                           Double unitPrice, Double totalCost, LocalDate usageDate, String notes) {
        this.farmerId = farmerId;
        this.cycle = cycle;
        this.farmInput = farmInput;
        this.inputName = inputName;
        this.inputType = inputType;
        this.quantityUsed = quantityUsed;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.totalCost = totalCost;
        this.usageDate = usageDate;
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

    // --- Getters & Setters ---

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

    public Cycle getCycle() {
        return cycle;
    }

    public void setCycle(Cycle cycle) {
        this.cycle = cycle;
    }

    public FarmInput getFarmInput() {
        return farmInput;
    }

    public void setFarmInput(FarmInput farmInput) {
        this.farmInput = farmInput;
    }

    public String getInputName() {
        return inputName;
    }

    public void setInputName(String inputName) {
        this.inputName = inputName;
    }

    public InputType getInputType() {
        return inputType;
    }

    public void setInputType(InputType inputType) {
        this.inputType = inputType;
    }

    public Double getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Double quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
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
