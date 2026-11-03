package com.farmer.tracking.modules.expense.api;

import com.farmer.tracking.modules.expense.entity.ExpenseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Expense type is required")
    private ExpenseType type;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be a positive number")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    @NotBlank(message = "Notes must not exceed 1000 characters")
    private String notes = "";

    private Long cycleId;

    public ExpenseRequest() {}

    public ExpenseRequest(String description, ExpenseType type, BigDecimal amount,
                          LocalDate expenseDate, String notes) {
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    public ExpenseRequest(String description, ExpenseType type, BigDecimal amount,
                          LocalDate expenseDate, String notes, Long cycleId) {
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
        this.cycleId = cycleId;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ExpenseType getType() { return type; }
    public void setType(ExpenseType type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes == null ? "" : notes; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
}
