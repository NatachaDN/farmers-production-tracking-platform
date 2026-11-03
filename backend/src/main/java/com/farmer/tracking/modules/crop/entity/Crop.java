package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
