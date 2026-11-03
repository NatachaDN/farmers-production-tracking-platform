package com.farmer.tracking.modules.expense.repository;

import com.farmer.tracking.modules.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByFarmerIdOrderByExpenseDateDescCreatedAtDesc(Long farmerId);

    Optional<Expense> findByIdAndFarmerId(Long id, Long farmerId);
}
