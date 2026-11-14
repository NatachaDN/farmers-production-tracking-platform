package com.farmer.tracking.modules.animal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AnimalActivityRequest {
    @NotBlank(message = "Activity type is required")
    private String activityType;

    @NotNull(message = "Activity date is required")
    private LocalDate activityDate;

    private String performedBy;
    private Double cost;
    private String notes;

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    public LocalDate getActivityDate() { return activityDate; }
    public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

