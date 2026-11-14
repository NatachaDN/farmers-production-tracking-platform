package com.farmer.tracking.modules.auth.model;

/**
 * Membership and registration verification status for a farmer account.
 */
public enum RegistrationStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED;

    public static RegistrationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return APPROVED;
        }
        try {
            return RegistrationStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return APPROVED;
        }
    }
}
