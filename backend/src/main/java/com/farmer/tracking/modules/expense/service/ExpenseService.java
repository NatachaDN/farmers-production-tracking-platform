package com.farmer.tracking.modules.expense.service;

import com.farmer.tracking.modules.expense.api.ExpenseRequest;
import com.farmer.tracking.modules.expense.api.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse recordExpense(Long farmerId, ExpenseRequest request);

    List<ExpenseResponse> getExpensesByFarmer(Long farmerId);

    List<ExpenseResponse> getExpensesByFarmerAndCycle(Long farmerId, Long cycleId);

    void deleteExpense(Long farmerId, Long expenseId);
}
