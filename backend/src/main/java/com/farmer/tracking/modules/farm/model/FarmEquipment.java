package com.farmer.tracking.modules.farm.model;

import jakarta.persistence.*;

@Entity
@Table(name = "farm_equipment", indexes = @Index(name = "idx_equipment_farmer", columnList = "farmer_id"))
public class FarmEquipment {
    public enum Status { AVAILABLE, BROKEN, MAINTENANCE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(length = 300)
    private String notes;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    protected FarmEquipment() {}

    public FarmEquipment(Long farmerId, String name, String notes, Status status) {
        this.farmerId = farmerId;
        this.name = name;
        this.notes = notes;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getNotes() { return notes; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
