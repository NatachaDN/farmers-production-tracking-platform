package com.farmer.tracking.modules.expense.api;

import com.farmer.tracking.modules.expense.entity.Expense;
import com.farmer.tracking.modules.expense.entity.ExpenseType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseResponse {

    private Long id;
    private Long farmerId;
    private Long cycleId;
    private String description;
    private ExpenseType type;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExpenseResponse() {}

    public ExpenseResponse(Long id, Long farmerId, Long cycleId, String description, ExpenseType type,
                           BigDecimal amount, LocalDate expenseDate, String notes,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.farmerId = farmerId;
        this.cycleId = cycleId;
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ExpenseResponse fromEntity(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getFarmerId(),
                expense.getCycleId(),
                expense.getDescription(),
                expense.getType(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getNotes(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
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
