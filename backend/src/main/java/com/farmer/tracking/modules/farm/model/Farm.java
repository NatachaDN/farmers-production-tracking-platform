package com.farmer.tracking.modules.farm.model;

import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farms", indexes = {
        @Index(name = "idx_farm_farmer_id", columnList = "farmer_id")
})
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private FarmType type;

    @Column(name = "size", nullable = false)
    private Double size;

    @Enumerated(EnumType.STRING)
    @Column(name = "size_unit", nullable = false, length = 20)
    private SizeUnit sizeUnit;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FarmStatus status = FarmStatus.ACTIVE;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "map_image_url", length = 500)
    private String mapImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "soil_type", length = 30)
    private SoilType soilType;

    @Enumerated(EnumType.STRING)
    @Column(name = "slope", length = 30)
    private SlopeType slope;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_to_water", length = 10)
    private AccessToWater accessToWater;

    @Column(name = "additional_notes", length = 500)
    private String additionalNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Farm() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Farmer getFarmer() {
        return farmer;
    }

    public void setFarmer(Farmer farmer) {
        this.farmer = farmer;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public FarmType getType() {
        return type;
    }

    public void setType(FarmType type) {
        this.type = type;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public SizeUnit getSizeUnit() {
        return sizeUnit;
    }

    public void setSizeUnit(SizeUnit sizeUnit) {
        this.sizeUnit = sizeUnit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FarmStatus getStatus() {
        return status;
    }

    public void setStatus(FarmStatus status) {
        this.status = status;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getMapImageUrl() {
        return mapImageUrl;
    }

    public void setMapImageUrl(String mapImageUrl) {
        this.mapImageUrl = mapImageUrl;
    }

    public SoilType getSoilType() {
        return soilType;
    }

    public void setSoilType(SoilType soilType) {
        this.soilType = soilType;
    }

    public SlopeType getSlope() {
        return slope;
    }

    public void setSlope(SlopeType slope) {
        this.slope = slope;
    }

    public AccessToWater getAccessToWater() {
        return accessToWater;
    }

    public void setAccessToWater(AccessToWater accessToWater) {
        this.accessToWater = accessToWater;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
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
