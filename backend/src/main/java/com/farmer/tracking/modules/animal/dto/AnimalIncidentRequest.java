package com.farmer.tracking.modules.animal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AnimalIncidentRequest {
    @NotBlank(message = "Incident type is required")
    private String incidentType;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    private Integer affectedCount;
    private Integer severityLevel;

    @NotBlank(message = "Description is required")
    private String description;

    private String actionTaken;

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
}

