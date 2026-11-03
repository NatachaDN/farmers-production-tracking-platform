package com.farmer.tracking.modules.sale.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.FarmerAccessGuard;
import com.farmer.tracking.modules.expense.api.ExpenseResponse;
import com.farmer.tracking.modules.expense.service.ExpenseService;
import com.farmer.tracking.modules.sale.api.MarginResponse;
import com.farmer.tracking.modules.sale.api.SaleRequest;
import com.farmer.tracking.modules.sale.api.SaleResponse;
import com.farmer.tracking.modules.sale.entity.Sale;
import com.farmer.tracking.modules.sale.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ExpenseService expenseService;

    public SaleServiceImpl(SaleRepository saleRepository, ExpenseService expenseService) {
        this.saleRepository = saleRepository;
        this.expenseService = expenseService;
    }

    @Override
    public SaleResponse recordSale(Long farmerId, SaleRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "sale");

        if (request.getCycleId() == null) {
            throw new IllegalArgumentException("Cycle ID is required");
        }
        if (request.getQuantitySold() == null || request.getQuantitySold().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity sold must be a positive number");
        }
        if (request.getPricePerUnit() == null || request.getPricePerUnit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per unit must be a positive number");
        }
        if (request.getBuyer() == null || request.getBuyer().trim().isEmpty()) {
            throw new IllegalArgumentException("Buyer is required");
        }
        if (request.getSaleDate() == null) {
            throw new IllegalArgumentException("Sale date is required");
        }

        BigDecimal totalRevenue = request.getQuantitySold().multiply(request.getPricePerUnit())
                .setScale(2, java.math.RoundingMode.HALF_UP);

        Sale sale = new Sale(
                farmerId,
                request.getCycleId(),
                request.getHarvestId(),
                request.getQuantitySold(),
                request.getUnit().trim(),
                request.getPricePerUnit(),
                totalRevenue,
                request.getBuyer().trim(),
                request.getSaleDate(),
                request.getNotes()
        );

        Sale saved = saleRepository.save(sale);
        return SaleResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponse> getSalesByFarmer(Long farmerId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "sale");
        return saleRepository.findByFarmerIdOrderBySaleDateDescCreatedAtDesc(farmerId).stream()
                .map(SaleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponse> getSalesByCycle(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "sale");
        return saleRepository.findByCycleId(cycleId).stream()
                .filter(sale -> farmerId.equals(sale.getFarmerId()))
                .map(SaleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MarginResponse getMargin(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "sale");

        // Total sales revenue for this cycle
        List<Sale> sales = saleRepository.findByCycleId(cycleId).stream()
                .filter(sale -> farmerId.equals(sale.getFarmerId()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalRevenue)
                .filter(rev -> rev != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Associated expenses linked to this cycle
        List<ExpenseResponse> expenses = expenseService.getExpensesByFarmerAndCycle(farmerId, cycleId);
        BigDecimal totalExpenses = expenses.stream()
                .map(ExpenseResponse::getAmount)
                .filter(amt -> amt != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal margin = totalRevenue.subtract(totalExpenses);

        return new MarginResponse(
                cycleId,
                null, // cycleName resolved by controller if desired
                totalRevenue,
                totalExpenses,
                margin
        );
    }

    @Override
    @Transactional
    public void deleteSale(Long farmerId, Long saleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "sale");
        Sale sale = saleRepository.findByIdAndFarmerId(saleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + saleId + " for farmer: " + farmerId));
        saleRepository.delete(sale);
    }
}
