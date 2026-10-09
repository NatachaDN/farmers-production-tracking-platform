package com.farmer.tracking.modules.farm.entity;

import com.farmer.tracking.modules.plot.entity.Plot;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a farmer's farm holding, grouping plots and production activities.
 */
@Entity
@Table(name = "farms", indexes = {
        @Index(name = "idx_farms_farmer_id", columnList = "farmer_id")
})
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 255)
    private String location;

    @Column(length = 255)
    private String description;

    @Column(name = "country", length = 100)
    private String country = "Kenya";

    @Column(name = "district", length = 100)
    private String district = "Nakuru";

    @Column(name = "region", length = 100)
    private String region = "Rift Valley";

    @Column(name = "county", length = 100)
    private String county = "Nakuru";

    @Column(name = "village", length = 100)
    private String village = "Central";

    @Column(name = "size")
    private Double size = 0.0;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "farm", cascade = CascadeType.ALL)
    private List<Plot> plots = new ArrayList<>();

    public Farm() {}

    public Farm(Long farmerId, String name, String location, String description, Boolean isDefault) {
        this.farmerId = farmerId;
        this.name = name;
        this.location = location;
        this.description = description;
        this.isDefault = isDefault != null ? isDefault : false;
        this.country = "Kenya";
        this.district = "Nakuru";
        this.region = "Rift Valley";
        this.county = "Nakuru";
        this.village = "Central";
        this.size = 0.0;
    }

    public Farm(Long farmerId, String name, String location, String description, String country, Boolean isDefault) {
        this.farmerId = farmerId;
        this.name = name;
        this.location = location;
        this.description = description;
        this.country = country != null ? country : "Kenya";
        this.district = "Nakuru";
        this.region = "Rift Valley";
        this.county = "Nakuru";
        this.village = "Central";
        this.size = 0.0;
        this.isDefault = isDefault != null ? isDefault : false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDefault == null) {
            this.isDefault = false;
        }
        if (this.country == null || this.country.isBlank()) {
            this.country = "Kenya";
        }
        if (this.district == null || this.district.isBlank()) {
            this.district = "Nakuru";
        }
        if (this.region == null || this.region.isBlank()) {
            this.region = "Rift Valley";
        }
        if (this.county == null || this.county.isBlank()) {
            this.county = "Nakuru";
        }
        if (this.village == null || this.village.isBlank()) {
            this.village = "Central";
        }
        if (this.size == null) {
            this.size = 0.0;
        }
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCounty() {
        return county;
    }

    public void setCounty(String county) {
        this.county = county;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
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

    public List<Plot> getPlots() {
        return plots;
    }

    public void setPlots(List<Plot> plots) {
        this.plots = plots;
    }
}
