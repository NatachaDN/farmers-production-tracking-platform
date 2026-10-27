package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.IncidentType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Request DTO for creating or updating a cycle incident.
 * All inputs are validated server-side before reaching the service layer.
 */
public class CycleIncidentRequest {

    @NotNull(message = "Incident type is required")
    private IncidentType incidentType;

    @NotNull(message = "Incident date is required")
    @PastOrPresent(message = "Incident date cannot be in the future")
    private LocalDate incidentDate;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Min(value = 1, message = "Severity level must be between 1 and 5")
    @Max(value = 5, message = "Severity level must be between 1 and 5")
    private Integer severityLevel;

    @Size(max = 2000, message = "Action taken must not exceed 2000 characters")
    private String actionTaken;

    // --- Constructors ---

    public CycleIncidentRequest() {}

    public CycleIncidentRequest(IncidentType incidentType, LocalDate incidentDate,
                                String description, Integer severityLevel, String actionTaken) {
        this.incidentType  = incidentType;
        this.incidentDate  = incidentDate;
        this.description   = description;
        this.severityLevel = severityLevel;
        this.actionTaken   = actionTaken;
    }

    // --- Getters and Setters ---

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
}
