package com.farmer.tracking.modules.notification.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Records that one user has read a broadcast notification (sent to a role or to everyone).
 * Direct notifications keep using {@link Notification#isRead()}; broadcasts need one receipt per
 * user, otherwise the first reader would mark the message as read for every recipient.
 */
@Entity
@Table(name = "notification_reads", uniqueConstraints = {
        @UniqueConstraint(name = "uk_notification_reads_notification_user", columnNames = {"notification_id", "user_id"})
}, indexes = {
        @Index(name = "idx_notification_reads_user", columnList = "user_id")
})
public class NotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "read_at", nullable = false)
    private LocalDateTime readAt;

    protected NotificationRead() {}

    public NotificationRead(Long notificationId, Long userId) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.readAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getNotificationId() { return notificationId; }
    public Long getUserId() { return userId; }
    public LocalDateTime getReadAt() { return readAt; }
}
