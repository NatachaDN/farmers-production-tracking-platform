package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an incident (disease, pest, or damage) recorded on a crop production cycle.
 * <p>
 * Each incident tracks <strong>what</strong> happened ({@link IncidentType}),
 * <strong>when</strong> ({@code incidentDate}), and a free-text {@code description}.
 * </p>
 */
@Entity
@Table(name = "cycle_incidents", indexes = {
        @Index(name = "idx_cycle_incidents_cycle_id",   columnList = "cycle_id"),
        @Index(name = "idx_cycle_incidents_farmer_id",  columnList = "farmer_id"),
        @Index(name = "idx_cycle_incidents_date",       columnList = "incident_date"),
        @Index(name = "idx_cycle_incidents_type",       columnList = "incident_type")
})
public class CycleIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Denormalized for fast farmer-scoped queries without join. */
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private Cycle cycle;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type", nullable = false, length = 40)
    private IncidentType incidentType;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Optional severity level (1 = low, 5 = critical). Null means unrated. */
    @Column(name = "severity_level")
    private Integer severityLevel;

    /** Optional action taken to address the incident. */
    @Column(name = "action_taken", columnDefinition = "TEXT")
    private String actionTaken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- Lifecycle callbacks ---

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- Constructors ---

    public CycleIncident() {}

    public CycleIncident(Long farmerId, Cycle cycle, IncidentType incidentType,
                         LocalDate incidentDate, String description,
                         Integer severityLevel, String actionTaken) {
        this.farmerId     = farmerId;
        this.cycle        = cycle;
        this.incidentType = incidentType;
        this.incidentDate = incidentDate;
        this.description  = description;
        this.severityLevel = severityLevel;
        this.actionTaken  = actionTaken;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public Cycle getCycle() { return cycle; }
    public void setCycle(Cycle cycle) { this.cycle = cycle; }

    public IncidentType getIncidentType() { return incidentType; }
    public void setIncidentType(IncidentType incidentType) { this.incidentType = incidentType; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(Integer severityLevel) { this.severityLevel = severityLevel; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
