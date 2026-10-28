package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.IncidentType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO returned when reading a cycle incident.
 */
public class CycleIncidentResponse {

    private Long id;
    private Long cycleId;
    private Long farmerId;
    private IncidentType incidentType;
    private LocalDate incidentDate;
    private String description;
    private Integer severityLevel;
    private String actionTaken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Constructors ---

    public CycleIncidentResponse() {}

    public CycleIncidentResponse(Long id, Long cycleId, Long farmerId,
                                 IncidentType incidentType, LocalDate incidentDate,
                                 String description, Integer severityLevel, String actionTaken,
                                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id            = id;
        this.cycleId       = cycleId;
        this.farmerId      = farmerId;
        this.incidentType  = incidentType;
        this.incidentDate  = incidentDate;
        this.description   = description;
        this.severityLevel = severityLevel;
        this.actionTaken   = actionTaken;
        this.createdAt     = createdAt;
        this.updatedAt     = updatedAt;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

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
