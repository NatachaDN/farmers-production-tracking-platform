package com.farmer.tracking.modules.animal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "animal_incidents", indexes = {
        @Index(name = "idx_animal_incidents_group_id", columnList = "animal_group_id"),
        @Index(name = "idx_animal_incidents_farmer_id", columnList = "farmer_id")
})
public class AnimalIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_group_id", nullable = false)
    private AnimalGroup animalGroup;

    @Column(name = "incident_type", nullable = false, length = 50)
    private String incidentType;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "affected_count")
    private Integer affectedCount;

    @Column(name = "severity_level")
    private Integer severityLevel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "action_taken", columnDefinition = "TEXT")
    private String actionTaken;

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

    public AnimalIncident() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public AnimalGroup getAnimalGroup() { return animalGroup; }
    public void setAnimalGroup(AnimalGroup animalGroup) { this.animalGroup = animalGroup; }

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public Integer getAffectedCount() { return affectedCount; }
    public void setAffectedCount(Integer affectedCount) { this.affectedCount = affectedCount; }

    public Integer getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(Integer severityLevel) { this.severityLevel = severityLevel; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
