package com.farmer.tracking.modules.notification.dto;

import com.farmer.tracking.modules.notification.model.Notification;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class NotificationDtos {

    private NotificationDtos() {}

    public record SendNotificationRequest(
            Long recipientId,
            String recipientRole,
            @NotBlank String title,
            @NotBlank String message,
            String type
    ) {}

    public record NotificationResponse(
            Long id,
            Long recipientId,
            String recipientRole,
            Long senderId,
            String senderName,
            String title,
            String message,
            String type,
            boolean isRead,
            LocalDateTime createdAt
    ) {
        public static NotificationResponse from(Notification n) {
            return new NotificationResponse(
                    n.getId(),
                    n.getRecipientId(),
                    n.getRecipientRole(),
                    n.getSenderId(),
                    n.getSenderName(),
                    n.getTitle(),
                    n.getMessage(),
                    n.getType(),
                    n.isRead(),
                    n.getCreatedAt()
            );
        }
    }
}

