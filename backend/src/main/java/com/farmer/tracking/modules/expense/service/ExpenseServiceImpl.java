package com.farmer.tracking.modules.expense.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.FarmerAccessGuard;
import com.farmer.tracking.modules.expense.api.ExpenseRequest;
import com.farmer.tracking.modules.expense.api.ExpenseResponse;
import com.farmer.tracking.modules.expense.entity.Expense;
import com.farmer.tracking.modules.expense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Override
    public ExpenseResponse recordExpense(Long farmerId, ExpenseRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "expense");

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Expense type is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be a positive number");
        }
        if (request.getExpenseDate() == null) {
            throw new IllegalArgumentException("Expense date is required");
        }

        Expense expense = new Expense(
                farmerId,
                request.getCycleId(),
                request.getDescription().trim(),
                request.getType(),
                request.getAmount(),
                request.getExpenseDate(),
                request.getNotes()
        );

        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByFarmer(Long farmerId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "expense");
        return expenseRepository.findByFarmerIdOrderByExpenseDateDescCreatedAtDesc(farmerId).stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByFarmerAndCycle(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "expense");
        return expenseRepository.findByFarmerIdOrderByExpenseDateDescCreatedAtDesc(farmerId).stream()
                .filter(expense -> cycleId.equals(expense.getCycleId()))
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExpense(Long farmerId, Long expenseId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "expense");
        Expense expense = expenseRepository.findByIdAndFarmerId(expenseId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId + " for farmer: " + farmerId));
        expenseRepository.delete(expense);
    }
}
