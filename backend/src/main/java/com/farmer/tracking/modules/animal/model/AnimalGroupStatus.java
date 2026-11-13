package com.farmer.tracking.modules.animal.model;

/**
 * Lifecycle status of an animal group.
 */
public enum AnimalGroupStatus {
    ACTIVE,
    INACTIVE,
    ARCHIVED,
    SOLD;

    public static AnimalGroupStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ACTIVE;
        }
        try {
            return AnimalGroupStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
