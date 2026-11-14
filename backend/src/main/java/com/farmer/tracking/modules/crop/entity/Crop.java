package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a crop registered in the farmer's personal catalog.
 * Farmers can register crops with their specific variety (e.g. Maize - Hybrid 614)
 * to easily reuse when creating production cycles.
 */
@Entity
@Table(name = "crops", indexes = {
        @Index(name = "idx_crops_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_crops_farmer_name", columnList = "farmer_id, name")
})
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 120)
    private String variety;

    @Column(length = 60)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "growth_duration_days")
    private Integer growthDurationDays;

    @Column(name = "expected_yield_per_hectare")
    private Double expectedYieldPerHectare;

    @Column(name = "yield_unit", length = 20)
    private String yieldUnit;

    @Column(name = "planting_season", length = 120)
    private String plantingSeason;

    @Column(name = "water_requirement", length = 40)
    private String waterRequirement;

    @Column(name = "soil_preference", length = 160)
    private String soilPreference;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crop_images", joinColumns = @JoinColumn(name = "crop_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", length = 1000, nullable = false)
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Crop() {}

    public Crop(Long farmerId, String name, String variety) {
        this.farmerId = farmerId;
        this.name = name;
        this.variety = variety;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getGrowthDurationDays() {
        return growthDurationDays;
    }

    public void setGrowthDurationDays(Integer growthDurationDays) {
        this.growthDurationDays = growthDurationDays;
    }

    public Double getExpectedYieldPerHectare() {
        return expectedYieldPerHectare;
    }

    public void setExpectedYieldPerHectare(Double expectedYieldPerHectare) {
        this.expectedYieldPerHectare = expectedYieldPerHectare;
    }

    public String getYieldUnit() {
        return yieldUnit;
    }

    public void setYieldUnit(String yieldUnit) {
        this.yieldUnit = yieldUnit;
    }

    public String getPlantingSeason() {
        return plantingSeason;
    }

    public void setPlantingSeason(String plantingSeason) {
        this.plantingSeason = plantingSeason;
    }

    public String getWaterRequirement() {
        return waterRequirement;
    }

    public void setWaterRequirement(String waterRequirement) {
        this.waterRequirement = waterRequirement;
    }

    public String getSoilPreference() {
        return soilPreference;
    }

    public void setSoilPreference(String soilPreference) {
        this.soilPreference = soilPreference;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
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
