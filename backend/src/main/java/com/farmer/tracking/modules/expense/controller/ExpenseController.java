package com.farmer.tracking.modules.expense.controller;

import com.farmer.tracking.modules.expense.api.ExpenseRequest;
import com.farmer.tracking.modules.expense.api.ExpenseResponse;
import com.farmer.tracking.modules.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for recording and managing production-related expenses
 * (input purchases, labor, transport).
 * <p>
 * Base path: {@code /api/v1/farmers/{farmerId}/expenses}
 * </p>
 */
@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/expenses")
@Tag(name = "Expenses", description = "Record and track production-related expenses (input purchases, labor, transport)")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    @Operation(
            summary = "Record a production expense",
            description = "Records a production-related expense with description, category (input purchase, labor, transport, other), amount, and date."
    )
    @ApiResponse(responseCode = "201", description = "Expense recorded successfully")
    @ApiResponse(responseCode = "400", description = "Validation error (e.g. non-positive amount)")
    public ResponseEntity<ExpenseResponse> recordExpense(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.recordExpense(farmerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "List all expenses for a farmer",
            description = "Returns all production expenses for the authenticated farmer, newest first."
    )
    @ApiResponse(responseCode = "200", description = "List of expenses returned")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @Parameter(description = "Farmer ID — enforces data isolation") @PathVariable Long farmerId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByFarmer(farmerId);
        return ResponseEntity.ok(expenses);
    }

    @DeleteMapping("/{expenseId}")
    @Operation(
            summary = "Delete an expense",
            description = "Deletes a production expense belonging to the authenticated farmer."
    )
    @ApiResponse(responseCode = "204", description = "Expense deleted successfully")
    @ApiResponse(responseCode = "404", description = "Expense not found")
    public ResponseEntity<Void> deleteExpense(
            @Parameter(description = "Farmer ID") @PathVariable Long farmerId,
            @Parameter(description = "Expense ID") @PathVariable Long expenseId) {
        expenseService.deleteExpense(farmerId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
