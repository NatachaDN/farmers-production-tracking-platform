package com.farmer.tracking.modules.animal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a group of animals (livestock) owned by a farmer, tracked for production purposes.
 */
@Entity
@Table(name = "animal_groups", indexes = {
        @Index(name = "idx_animal_groups_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_animal_groups_type", columnList = "type"),
        @Index(name = "idx_animal_groups_purpose", columnList = "purpose")
})
public class AnimalGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AnimalType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductionPurpose purpose;

    @Column(name = "number_of_animals", nullable = false)
    private Integer numberOfAnimals;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AnimalGroup() {}

    public AnimalGroup(Long farmerId, AnimalType type, ProductionPurpose purpose,
                       Integer numberOfAnimals, LocalDate startDate, String notes) {
        this.farmerId = farmerId;
        this.type = type;
        this.purpose = purpose;
        this.numberOfAnimals = numberOfAnimals;
        this.startDate = startDate;
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

    public AnimalType getType() {
        return type;
    }

    public void setType(AnimalType type) {
        this.type = type;
    }

    public ProductionPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(ProductionPurpose purpose) {
        this.purpose = purpose;
    }

    public Integer getNumberOfAnimals() {
        return numberOfAnimals;
    }

    public void setNumberOfAnimals(Integer numberOfAnimals) {
        this.numberOfAnimals = numberOfAnimals;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
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
