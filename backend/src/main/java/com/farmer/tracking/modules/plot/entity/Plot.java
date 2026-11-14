package com.farmer.tracking.modules.plot.entity;

import com.farmer.tracking.modules.farm.model.Farm;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a land plot on a farmer's farm.
 */
@Entity
@Table(name = "plots", indexes = {
        @Index(name = "idx_plots_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_plots_farm_id", columnList = "farm_id")
})
public class Plot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private Double area;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(name = "crop_type", length = 80)
    private String cropType;

    @Column(length = 80)
    private String stage;

    @Column(name = "soil_type", length = 80)
    private String soilType;

    @Column(name = "irrigation_type", length = 80)
    private String irrigationType;

    @Column(length = 80)
    private String slope;

    @Column(length = 1000)
    private String notes;

    @Column(name = "animal_group_id")
    private Long animalGroupId;

    @Column(name = "animal_group_name", length = 150)
    private String animalGroupName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plot_images", joinColumns = @JoinColumn(name = "plot_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", length = 1024)
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Plot() {}

    public Plot(Long farmerId, String name, Double area, String location, String cropType, String stage) {
        this.farmerId = farmerId;
        this.name = name;
        this.area = area;
        this.location = location;
        this.cropType = cropType;
        this.stage = stage;
    }

    public Plot(Long farmerId, Farm farm, String name, Double area, String location, String cropType, String stage) {
        this.farmerId = farmerId;
        this.farm = farm;
        this.name = name;
        this.area = area;
        this.location = location;
        this.cropType = cropType;
        this.stage = stage;
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

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Farm getFarm() {
        return farm;
    }

    public void setFarm(Farm farm) {
        this.farm = farm;
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

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getIrrigationType() {
        return irrigationType;
    }

    public void setIrrigationType(String irrigationType) {
        this.irrigationType = irrigationType;
    }

    public String getSlope() {
        return slope;
    }

    public void setSlope(String slope) {
        this.slope = slope;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? new ArrayList<>(imageUrls) : new ArrayList<>();
    }

    public Long getAnimalGroupId() {
        return animalGroupId;
    }

    public void setAnimalGroupId(Long animalGroupId) {
        this.animalGroupId = animalGroupId;
    }

    public String getAnimalGroupName() {
        return animalGroupName;
    }

    public void setAnimalGroupName(String animalGroupName) {
        this.animalGroupName = animalGroupName;
    }
}
