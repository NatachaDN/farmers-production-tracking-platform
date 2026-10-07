package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.ActivityType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for creating or updating a cycle activity.
 * All inputs are validated server‑side before reaching the service layer.
 */
public class CycleActivityRequest {

    @NotNull(message = "Activity type is required")
    private ActivityType activityType;

    @NotNull(message = "Activity date is required")
    @PastOrPresent(message = "Activity date cannot be in the future")
    private LocalDate activityDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    // --- Constructors ---

    public CycleActivityRequest() {
    }

    public CycleActivityRequest(ActivityType activityType, LocalDate activityDate, String notes) {
        this.activityType = activityType;
        this.activityDate = activityDate;
        this.notes = notes;
    }

    // --- Getters and Setters ---

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
