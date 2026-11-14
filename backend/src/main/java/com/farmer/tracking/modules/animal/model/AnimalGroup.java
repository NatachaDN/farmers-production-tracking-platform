package com.farmer.tracking.modules.animal.model;

import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.farm.model.Farm;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a group, herd, flock, pen, or colony of animals managed by a farmer.
 */
@Entity
@Table(name = "animal_groups", indexes = {
        @Index(name = "idx_animal_groups_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_animal_groups_farm_id", columnList = "farm_id"),
        @Index(name = "idx_animal_groups_status", columnList = "status"),
        @Index(name = "idx_animal_groups_animal_type", columnList = "animal_type")
})
public class AnimalGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "animal_type", nullable = false, length = 40)
    private AnimalType animalType;

    @Column(name = "breed", length = 120)
    private String breed;

    @Column(name = "initial_population", nullable = false)
    private Integer initialPopulation;

    @Column(name = "current_population", nullable = false)
    private Integer currentPopulation;

    @Column(name = "number_of_animals", nullable = false)
    private Integer numberOfAnimals = 0;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "purpose", length = 80)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AnimalGroupStatus status = AnimalGroupStatus.ACTIVE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "feeding_regime", length = 160)
    private String feedingRegime;

    @Column(name = "health_status", length = 60)
    private String healthStatus;

    @Column(name = "average_weight_kg")
    private Double averageWeightKg;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "animal_group_images", joinColumns = @JoinColumn(name = "animal_group_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", length = 1000, nullable = false)
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AnimalGroup() {}

    public AnimalGroup(
            Farmer farmer,
            Farm farm,
            String name,
            AnimalType animalType,
            String breed,
            Integer initialPopulation,
            Integer currentPopulation,
            String location,
            String purpose,
            AnimalGroupStatus status,
            LocalDate startDate,
            String notes
    ) {
        this.farmer = farmer;
        this.farm = farm;
        this.name = name;
        this.animalType = animalType;
        this.breed = breed;
        this.initialPopulation = initialPopulation;
        this.currentPopulation = currentPopulation != null ? currentPopulation : initialPopulation;
        this.location = location;
        this.purpose = purpose;
        this.status = status != null ? status : AnimalGroupStatus.ACTIVE;
        this.startDate = startDate != null ? startDate : LocalDate.now();
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currentPopulation == null) {
            this.currentPopulation = this.initialPopulation;
        }
        this.numberOfAnimals = this.currentPopulation != null
                ? this.currentPopulation
                : (this.initialPopulation != null ? this.initialPopulation : 0);
        if (this.status == null) {
            this.status = AnimalGroupStatus.ACTIVE;
        }
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.numberOfAnimals = this.currentPopulation != null
                ? this.currentPopulation
                : (this.initialPopulation != null ? this.initialPopulation : 0);
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

    public Long getFarmerId() {
        return farmer != null ? farmer.getId() : null;
    }

    public Farm getFarm() {
        return farm;
    }

    public void setFarm(Farm farm) {
        this.farm = farm;
    }

    public Long getFarmId() {
        return farm != null ? farm.getId() : null;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(AnimalType animalType) {
        this.animalType = animalType;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Integer getInitialPopulation() {
        return initialPopulation;
    }

    public void setInitialPopulation(Integer initialPopulation) {
        this.initialPopulation = initialPopulation;
    }

    public Integer getCurrentPopulation() {
        return currentPopulation;
    }

    public void setCurrentPopulation(Integer currentPopulation) {
        this.currentPopulation = currentPopulation;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public AnimalGroupStatus getStatus() {
        return status;
    }

    public void setStatus(AnimalGroupStatus status) {
        this.status = status;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFeedingRegime() {
        return feedingRegime;
    }

    public void setFeedingRegime(String feedingRegime) {
        this.feedingRegime = feedingRegime;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public Double getAverageWeightKg() {
        return averageWeightKg;
    }

    public void setAverageWeightKg(Double averageWeightKg) {
        this.averageWeightKg = averageWeightKg;
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

