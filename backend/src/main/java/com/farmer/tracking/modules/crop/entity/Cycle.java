package com.farmer.tracking.modules.crop.entity;

import com.farmer.tracking.modules.plot.entity.Plot;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a crop production cycle.
 */
@Entity
@Table(name = "cycles", indexes = {
        @Index(name = "idx_cycles_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_cycles_plot_id", columnList = "plot_id"),
        @Index(name = "idx_cycles_status", columnList = "status")
})
public class Cycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id")
    private Plot plot;

    @Column(name = "crop_name")
    private String cropName;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CycleStatus status = CycleStatus.ACTIVE;

    @Column(name = "acreage")
    private Double acreage;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "expected_quantity")
    private Double expectedQuantity;

    @Column(name = "expected_quantity_unit", length = 30)
    private String expectedQuantityUnit = "kg";

    @Column(length = 80)
    private String stage;

    @Column(name = "progress")
    private Integer progress = 0;

    @Column(name = "sub_status", length = 120)
    private String subStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CycleActivity> activities = new ArrayList<>();

    public Cycle() {}

    public Cycle(Long farmerId, Plot plot, String cropName, String name, LocalDate startDate, LocalDate endDate, Double expectedQuantity, String expectedQuantityUnit, Double acreage) {
        this.farmerId = farmerId;
        this.plot = plot;
        this.cropName = cropName;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.expectedQuantity = expectedQuantity;
        this.expectedQuantityUnit = expectedQuantityUnit != null ? expectedQuantityUnit : "kg";
        this.acreage = acreage;
        this.status = CycleStatus.ACTIVE;
        this.stage = "Planting";
        this.progress = 0;
    }

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

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public Plot getPlot() {
        return plot;
    }

    public void setPlot(Plot plot) {
        this.plot = plot;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CycleStatus getStatus() {
        return status;
    }

    public void setStatus(CycleStatus status) {
        this.status = status;
    }

    public Double getAcreage() {
        return acreage;
    }

    public void setAcreage(Double acreage) {
        this.acreage = acreage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getExpectedQuantity() {
        return expectedQuantity;
    }

    public void setExpectedQuantity(Double expectedQuantity) {
        this.expectedQuantity = expectedQuantity;
    }

    public String getExpectedQuantityUnit() {
        return expectedQuantityUnit;
    }

    public void setExpectedQuantityUnit(String expectedQuantityUnit) {
        this.expectedQuantityUnit = expectedQuantityUnit;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getSubStatus() {
        return subStatus;
    }

    public void setSubStatus(String subStatus) {
        this.subStatus = subStatus;
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

    public List<CycleActivity> getActivities() {
        return activities;
    }

    public void setActivities(List<CycleActivity> activities) {
        this.activities = activities;
    }
}
