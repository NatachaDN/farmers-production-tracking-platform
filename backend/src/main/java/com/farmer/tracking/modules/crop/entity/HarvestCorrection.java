package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "harvest_corrections", uniqueConstraints = @UniqueConstraint(columnNames = {"harvest_id", "revision"}))
public class HarvestCorrection {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "harvest_id", nullable = false) private Harvest harvest;
    @Column(nullable = false) private Long revision;
    @Column(nullable = false, length = 1000) private String reason;
    @Column(name = "actor_id", nullable = false) private Long actorId;
    @Column(name = "corrected_at", nullable = false) private LocalDateTime correctedAt;
    @Embedded @AttributeOverrides({
        @AttributeOverride(name = "quantity", column = @Column(name = "previous_quantity")),
        @AttributeOverride(name = "unit", column = @Column(name = "previous_unit")),
        @AttributeOverride(name = "harvestDate", column = @Column(name = "previous_date")),
        @AttributeOverride(name = "notes", column = @Column(name = "previous_notes", length = 1000)),
        @AttributeOverride(name = "calculatedYield", column = @Column(name = "previous_yield"))
    }) private HarvestValues beforeValues;
    @Embedded @AttributeOverrides({
        @AttributeOverride(name = "quantity", column = @Column(name = "corrected_quantity")),
        @AttributeOverride(name = "unit", column = @Column(name = "corrected_unit")),
        @AttributeOverride(name = "harvestDate", column = @Column(name = "corrected_date")),
        @AttributeOverride(name = "notes", column = @Column(name = "corrected_notes", length = 1000)),
        @AttributeOverride(name = "calculatedYield", column = @Column(name = "corrected_yield"))
    }) private HarvestValues afterValues;
    protected HarvestCorrection() {}
    public HarvestCorrection(Harvest harvest, HarvestValues beforeValues, String reason, Long actorId) {
        this.harvest = harvest; this.beforeValues = beforeValues; this.afterValues = new HarvestValues(harvest);
        this.reason = reason; this.actorId = actorId; this.revision = harvest.getRevision(); correctedAt = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public Long getRevision() { return revision; }
    public String getReason() { return reason; }
    public Long getActorId() { return actorId; }
    public LocalDateTime getCorrectedAt() { return correctedAt; }
    public HarvestValues getBeforeValues() { return beforeValues; }
    public HarvestValues getAfterValues() { return afterValues; }
}
