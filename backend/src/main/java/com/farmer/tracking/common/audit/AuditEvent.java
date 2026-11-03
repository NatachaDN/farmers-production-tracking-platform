package com.farmer.tracking.common.audit;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Immutable record of an authentication-related event (sign-up, sign-in, failed sign-in).
 */
@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_events_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_events_actor_id", columnList = "actor_id")
})
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private AuditEventType eventType;

    /** Farmer id when the actor is known (null for failed sign-ins). */
    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_label", length = 160)
    private String actorLabel;

    @Column(name = "detail", length = 255)
    private String detail;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected AuditEvent() {}

    public AuditEvent(AuditEventType eventType, Long actorId, String actorLabel, String detail, String ipAddress) {
        this.eventType = eventType;
        this.actorId = actorId;
        this.actorLabel = actorLabel;
        this.detail = detail;
        this.ipAddress = ipAddress;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public AuditEventType getEventType() { return eventType; }
    public Long getActorId() { return actorId; }
    public String getActorLabel() { return actorLabel; }
    public String getDetail() { return detail; }
    public String getIpAddress() { return ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
