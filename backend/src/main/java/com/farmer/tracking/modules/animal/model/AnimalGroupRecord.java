package com.farmer.tracking.modules.animal.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "animal_group_records", indexes = @Index(name = "idx_animal_records_group_date", columnList = "group_id,record_date"))
public class AnimalGroupRecord {
    public enum Kind { FEEDING, PRODUCTION, ADDITION, DEATH, SALE, REMOVAL, BIRTH }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private AnimalGroup group;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Kind kind;
    @Column(nullable = false, length = 80)
    private String name;
    @Column(nullable = false, precision = 16, scale = 3)
    private BigDecimal quantity;
    @Column(nullable = false, length = 24)
    private String unit;
    @Column(name = "record_date", nullable = false)
    private LocalDate date;

    protected AnimalGroupRecord() {}

    public AnimalGroupRecord(AnimalGroup group, Kind kind, String name, BigDecimal quantity, String unit, LocalDate date) {
        this.group = group;
        this.kind = kind;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.date = date;
    }

    public Long getId() { return id; }
    public String getGroupName() { return group.getName(); }
    public String getFarmName() { return group.getFarm().getName(); }
    public Kind getKind() { return kind; }
    public String getName() { return name; }
    public BigDecimal getQuantity() { return quantity; }
    public String getUnit() { return unit; }
    public LocalDate getDate() { return date; }
}
