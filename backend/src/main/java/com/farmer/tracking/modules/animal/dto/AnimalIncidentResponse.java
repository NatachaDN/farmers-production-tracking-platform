package com.farmer.tracking.modules.animal.dto;

import com.farmer.tracking.modules.animal.model.AnimalIncident;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalIncidentResponse {
    private Long id;
    private Long animalGroupId;
    private String animalGroupName;
    private String incidentType;
    private LocalDate incidentDate;
    private Integer affectedCount;
    private Integer severityLevel;
    private String description;
    private String actionTaken;
    private LocalDateTime createdAt;

    public static AnimalIncidentResponse fromEntity(AnimalIncident i) {
        AnimalIncidentResponse res = new AnimalIncidentResponse();
        res.id = i.getId();
        res.animalGroupId = i.getAnimalGroup().getId();
        res.animalGroupName = i.getAnimalGroup().getName();
        res.incidentType = i.getIncidentType();
        res.incidentDate = i.getIncidentDate();
        res.affectedCount = i.getAffectedCount();
        res.severityLevel = i.getSeverityLevel();
        res.description = i.getDescription();
        res.actionTaken = i.getActionTaken();
        res.createdAt = i.getCreatedAt();
        return res;
    }

    public Long getId() { return id; }
    public Long getAnimalGroupId() { return animalGroupId; }
    public String getAnimalGroupName() { return animalGroupName; }
    public String getIncidentType() { return incidentType; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public Integer getAffectedCount() { return affectedCount; }
    public Integer getSeverityLevel() { return severityLevel; }
    public String getDescription() { return description; }
    public String getActionTaken() { return actionTaken; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

