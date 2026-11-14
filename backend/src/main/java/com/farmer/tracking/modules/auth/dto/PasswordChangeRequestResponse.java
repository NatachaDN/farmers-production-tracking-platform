package com.farmer.tracking.modules.auth.dto;

import com.farmer.tracking.modules.auth.model.PasswordChangeRequest;

import java.time.LocalDateTime;

public record PasswordChangeRequestResponse(
        Long id,
        Long farmerId,
        String farmerName,
        String farmerEmailOrPhone,
        String farmName,
        String status,
        String reason,
        String adminNote,
        String reviewedByName,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
    public static PasswordChangeRequestResponse from(PasswordChangeRequest entity) {
        return new PasswordChangeRequestResponse(
                entity.getId(),
                entity.getFarmer().getId(),
                entity.getFarmer().getFullName(),
                entity.getFarmer().getEmailOrPhone(),
                entity.getFarmer().getFarmName(),
                entity.getStatus().name(),
                entity.getReason(),
                entity.getAdminNote(),
                entity.getReviewedByName(),
                entity.getCreatedAt(),
                entity.getReviewedAt()
        );
    }
}

