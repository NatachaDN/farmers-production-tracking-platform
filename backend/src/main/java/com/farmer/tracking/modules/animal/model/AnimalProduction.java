package com.farmer.tracking.modules.animal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "animal_productions", indexes = {
        @Index(name = "idx_animal_productions_group_id", columnList = "animal_group_id"),
        @Index(name = "idx_animal_productions_farmer_id", columnList = "farmer_id")
})
public class AnimalProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_group_id", nullable = false)
    private AnimalGroup animalGroup;

    @Column(name = "production_type", nullable = false, length = 40)
    private String productionType;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false, length = 30)
    private String unit;

    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(name = "quality_grade", length = 60)
    private String qualityGrade;

    @Column(name = "estimated_revenue")
    private Double estimatedRevenue;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public AnimalProduction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public AnimalGroup getAnimalGroup() { return animalGroup; }
    public void setAnimalGroup(AnimalGroup animalGroup) { this.animalGroup = animalGroup; }

    public String getProductionType() { return productionType; }
    public void setProductionType(String productionType) { this.productionType = productionType; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getProductionDate() { return productionDate; }
    public void setProductionDate(LocalDate productionDate) { this.productionDate = productionDate; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public Double getEstimatedRevenue() { return estimatedRevenue; }
    public void setEstimatedRevenue(Double estimatedRevenue) { this.estimatedRevenue = estimatedRevenue; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

