package com.farmer.tracking.modules.farm.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "farm_transactions", indexes = @Index(name = "idx_transaction_farmer_date", columnList = "farmer_id,record_date"))
public class FarmTransaction {
    public enum Kind { EXPENSE, SALE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;
    @Column(name = "cycle_id")
    private Long cycleId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Kind kind;
    @Column(nullable = false, length = 120)
    private String category;
    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal amount;
    @Column(name = "record_date", nullable = false)
    private LocalDate date;

    protected FarmTransaction() {}
    public FarmTransaction(Long farmerId, Long cycleId, Kind kind, String category, BigDecimal amount, LocalDate date) {
        this.farmerId = farmerId;
        this.cycleId = cycleId;
        this.kind = kind;
        this.category = category;
        this.amount = amount;
        this.date = date;
    }
    public Long getId() { return id; }
    public Long getCycleId() { return cycleId; }
    public Kind getKind() { return kind; }
    public String getCategory() { return category; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getDate() { return date; }
}
