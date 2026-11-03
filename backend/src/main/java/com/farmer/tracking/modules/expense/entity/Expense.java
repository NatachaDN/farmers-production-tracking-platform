package com.farmer.tracking.modules.expense.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a production-related expense recorded by a farmer
 * (e.g. input purchases, labor, transport).
 */
@Entity
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expenses_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_expenses_type", columnList = "type"),
        @Index(name = "idx_expenses_date", columnList = "expense_date")
})
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(name = "cycle_id")
    private Long cycleId;

    @Column(nullable = false, length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ExpenseType type;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Expense() {}

    public Expense(Long farmerId, String description, ExpenseType type, BigDecimal amount,
                   LocalDate expenseDate, String notes) {
        this.farmerId = farmerId;
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    public Expense(Long farmerId, Long cycleId, String description, ExpenseType type, BigDecimal amount,
                   LocalDate expenseDate, String notes) {
        this.farmerId = farmerId;
        this.cycleId = cycleId;
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ExpenseType getType() { return type; }
    public void setType(ExpenseType type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
