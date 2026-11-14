package com.farmer.tracking.modules.animal.dto;

import com.farmer.tracking.modules.animal.model.AnimalActivity;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalActivityResponse {
    private Long id;
    private Long animalGroupId;
    private String animalGroupName;
    private String activityType;
    private LocalDate activityDate;
    private String performedBy;
    private Double cost;
    private String notes;
    private LocalDateTime createdAt;

    public static AnimalActivityResponse fromEntity(AnimalActivity a) {
        AnimalActivityResponse res = new AnimalActivityResponse();
        res.id = a.getId();
        res.animalGroupId = a.getAnimalGroup().getId();
        res.animalGroupName = a.getAnimalGroup().getName();
        res.activityType = a.getActivityType();
        res.activityDate = a.getActivityDate();
        res.performedBy = a.getPerformedBy();
        res.cost = a.getCost();
        res.notes = a.getNotes();
        res.createdAt = a.getCreatedAt();
        return res;
    }

    public Long getId() { return id; }
    public Long getAnimalGroupId() { return animalGroupId; }
    public String getAnimalGroupName() { return animalGroupName; }
    public String getActivityType() { return activityType; }
    public LocalDate getActivityDate() { return activityDate; }
    public String getPerformedBy() { return performedBy; }
    public Double getCost() { return cost; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

