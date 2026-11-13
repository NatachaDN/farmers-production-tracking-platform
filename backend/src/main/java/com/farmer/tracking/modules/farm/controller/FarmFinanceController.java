package com.farmer.tracking.modules.farm.controller;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.*;
import com.farmer.tracking.modules.farm.model.FarmTransaction;
import com.farmer.tracking.modules.farm.model.FarmTransaction.Kind;
import com.farmer.tracking.modules.farm.repository.FarmTransactionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmers/{farmerId}/finances")
public class FarmFinanceController {
    private final FarmTransactionRepository transactions;
    private final CycleRepository cycles;
    private final HarvestRepository harvests;
    private final CycleInputUsageRepository usages;

    public FarmFinanceController(FarmTransactionRepository transactions, CycleRepository cycles,
            HarvestRepository harvests, CycleInputUsageRepository usages) {
        this.transactions = transactions;
        this.cycles = cycles;
        this.harvests = harvests;
        this.usages = usages;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Ledger list(@PathVariable Long farmerId) {
        var entries = transactions.findByFarmerIdOrderByDateDescIdDesc(farmerId);
        var recordedHarvests = harvests.findByCycle_FarmerId(farmerId).stream().map(row -> row.getCycle().getId()).collect(Collectors.toSet());
        var eligible = cycles.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .filter(cycle -> cycle.getStatus() == CycleStatus.COMPLETED && recordedHarvests.contains(cycle.getId()))
                .map(cycle -> new CycleOption(cycle.getId(), cycle.getName())).toList();
        var byCycle = entries.stream().filter(row -> row.getCycleId() != null).collect(Collectors.groupingBy(FarmTransaction::getCycleId));
        var inputCosts = usages.findByFarmerIdOrderByUsageDateDesc(farmerId).stream()
                .collect(Collectors.groupingBy(row -> row.getCycle().getId()));
        var margins = eligible.stream().filter(cycle -> byCycle.getOrDefault(cycle.id(), List.of()).stream()
                .anyMatch(row -> row.getKind() == Kind.SALE)).map(cycle -> {
                    var rows = byCycle.get(cycle.id());
                    var inputs = inputCosts.getOrDefault(cycle.id(), List.of());
                    var revenue = total(rows, Kind.SALE);
                    var expenses = total(rows, Kind.EXPENSE);
                    BigDecimal consumed = inputs.stream().allMatch(row -> row.isCostVerified())
                            ? inputs.stream().map(row -> BigDecimal.valueOf(row.getTotalCost()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP)
                            : null;
                    return new Margin(cycle.id(), cycle.name(), revenue, expenses, consumed,
                            consumed == null ? null : revenue.subtract(expenses).subtract(consumed));
                }).toList();
        return new Ledger(entries, eligible, margins);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public FarmTransaction record(@PathVariable Long farmerId, @Valid @RequestBody Entry request) {
        Cycle cycle = request.cycleId() == null ? null : cycles.findByIdAndFarmerId(request.cycleId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop cycle", request.cycleId()));
        if (request.kind() == Kind.SALE) {
            if (cycle == null || cycle.getStatus() != CycleStatus.COMPLETED) {
                throw new BadRequestException("Select a completed cycle with a recorded harvest.");
            }
            var harvest = harvests.findByCycleId(cycle.getId())
                    .orElseThrow(() -> new BadRequestException("Select a completed cycle with a recorded harvest."));
            if (request.date().isBefore(harvest.getHarvestDate())) {
                throw new BadRequestException("The sale date cannot be before the harvest.");
            }
        }
        return transactions.save(new FarmTransaction(farmerId, request.cycleId(), request.kind(),
                request.category().strip(), request.amount(), request.date()));
    }

    private static BigDecimal total(List<FarmTransaction> rows, Kind kind) {
        return rows.stream().filter(row -> row.getKind() == kind).map(FarmTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public record Entry(@NotNull Kind kind, Long cycleId, @NotBlank @Size(max = 120) String category,
            @NotNull @Positive @Digits(integer = 14, fraction = 2) BigDecimal amount, @NotNull @PastOrPresent LocalDate date) {}
    public record Ledger(List<FarmTransaction> entries, List<CycleOption> saleCycles, List<Margin> margins) {}
    public record CycleOption(Long id, String name) {}
    public record Margin(Long cycleId, String cycleName, BigDecimal sales, BigDecimal expenses,
            BigDecimal inputCosts, BigDecimal margin) {}
}
