package com.farmer.tracking.modules.crop.api;

import com.farmer.tracking.modules.crop.entity.ActivityType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO returned when reading a cycle activity.
 * Contains the activity's date, type, notes, and audit timestamps.
 */
public class CycleActivityResponse {

    private Long id;
    private Long cycleId;
    private ActivityType activityType;
    private LocalDate activityDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Constructors ---

    public CycleActivityResponse() {
    }

    public CycleActivityResponse(Long id, Long cycleId, ActivityType activityType,
                                  LocalDate activityDate, String notes,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.cycleId = cycleId;
        this.activityType = activityType;
        this.activityDate = activityDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCycleId() {
        return cycleId;
    }

    public void setCycleId(Long cycleId) {
        this.cycleId = cycleId;
    }

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
