package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.util.ProductionRules;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.CycleCostSummaryResponse;
import com.farmer.tracking.modules.crop.api.CycleInputUsageRequest;
import com.farmer.tracking.modules.crop.api.CycleInputUsageResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleInputUsageRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CycleInputUsageServiceImpl implements CycleInputUsageService {

    private final CycleInputUsageRepository cycleInputUsageRepository;
    private final CycleRepository cycleRepository;
    private final FarmInputRepository farmInputRepository;

    public CycleInputUsageServiceImpl(CycleInputUsageRepository cycleInputUsageRepository,
                                      CycleRepository cycleRepository,
                                      FarmInputRepository farmInputRepository) {
        this.cycleInputUsageRepository = cycleInputUsageRepository;
        this.cycleRepository = cycleRepository;
        this.farmInputRepository = farmInputRepository;
    }

    @Override
    public CycleInputUsageResponse recordInputUsage(Long farmerId, Long cycleId, CycleInputUsageRequest request) {
        validateFarmerAccess(farmerId);

        // 1. Verify cycle existence and ownership
        Cycle cycle = cycleRepository.findLockedByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        // 2. Validate cycle status (must be ACTIVE)
        if (cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalArgumentException("Input consumption can only be recorded for an ACTIVE cycle. Current status is: " + cycle.getStatus());
        }

        // 3. Validate quantity
        if (request.getQuantityUsed() == null || !Double.isFinite(request.getQuantityUsed()) || request.getQuantityUsed() < 0.01) {
            throw new IllegalArgumentException("Quantity used must be greater than 0");
        }

        // 4. Verify inventory input existence and ownership
        FarmInput farmInput = farmInputRepository.findLockedByIdAndFarmerId(request.getInputId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input not found with id: " + request.getInputId() + " for farmer: " + farmerId));

        // 5. Stock check: ensure available stock is sufficient (Acceptance Criterion 2)
        if (request.getQuantityUsed() > farmInput.getQuantity()) {
            throw new BadRequestException(String.format(
                    Locale.US,
                    "Insufficient stock. Available stock for '%s' is %.2f %s, but %.2f %s was requested.",
                    farmInput.getName(), farmInput.getQuantity(), farmInput.getUnit(),
                    request.getQuantityUsed(), farmInput.getUnit()
            ));
        }

        // 6. Real cost = quantity used x weighted-average cost of one unit in stock.
        //    (purchasePrice is the total paid for a purchase, not a per-unit price.)
        if (farmInput.getUnitCost() == null) {
            throw new ConflictException("Confirm this inventory item's unit cost in Farm Inputs before recording consumption.");
        }
        double unitPrice = farmInput.getUnitCost();
        double totalCost = Math.round((request.getQuantityUsed() * unitPrice) * 100.0) / 100.0;

        // 7. Deduct used quantity from inventory stock (Acceptance Criterion 1)
        double remainingStock = Math.round((farmInput.getQuantity() - request.getQuantityUsed()) * 100.0) / 100.0;
        farmInput.setUnitCost(unitPrice);
        farmInput.setQuantity(remainingStock);
        farmInputRepository.save(farmInput);

        LocalDate usageDate = (request.getUsageDate() != null) ? request.getUsageDate() : LocalDate.now();
        ProductionRules.eventDate(cycle, usageDate);

        // 8. Create and persist cycle input consumption record
        CycleInputUsage usage = new CycleInputUsage(
                farmerId,
                cycle,
                farmInput,
                farmInput.getName(),
                farmInput.getType(),
                request.getQuantityUsed(),
                farmInput.getUnit(),
                unitPrice,
                totalCost,
                usageDate,
                request.getNotes()
        );

        CycleInputUsage saved = cycleInputUsageRepository.save(usage);
        return CycleInputUsageResponse.fromEntity(saved, remainingStock);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CycleInputUsageResponse> getInputsByCycle(Long farmerId, Long cycleId) {
        validateFarmerAccess(farmerId);

        // Verify cycle existence and ownership
        cycleRepository.findById(cycleId)
                .filter(c -> c.getFarmerId().equals(farmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        return cycleInputUsageRepository.findByCycleIdAndFarmerIdOrderByUsageDateDesc(cycleId, farmerId)
                .stream()
                .map(CycleInputUsageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CycleCostSummaryResponse getCycleCostSummary(Long farmerId, Long cycleId) {
        validateFarmerAccess(farmerId);

        Cycle cycle = cycleRepository.findById(cycleId)
                .filter(c -> c.getFarmerId().equals(farmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        List<CycleInputUsage> usages = cycleInputUsageRepository.findByCycleIdAndFarmerIdOrderByUsageDateDesc(cycleId, farmerId);

        double totalInputCost = 0.0;
        Map<String, Double> costByType = new LinkedHashMap<>();

        for (CycleInputUsage usage : usages) {
            if (!usage.isCostVerified()) continue;
            double cost = usage.getTotalCost() != null ? usage.getTotalCost() : 0.0;
            totalInputCost += cost;

            String typeKey = usage.getInputType() != null ? usage.getInputType().name() : "OTHER";
            costByType.put(typeKey, costByType.getOrDefault(typeKey, 0.0) + cost);
        }

        totalInputCost = Math.round(totalInputCost * 100.0) / 100.0;

        List<CycleInputUsageResponse> items = usages.stream()
                .map(CycleInputUsageResponse::fromEntity)
                .collect(Collectors.toList());

        return new CycleCostSummaryResponse(
                cycle.getId(),
                cycle.getName(),
                cycle.getCropName(),
                usages.stream().allMatch(CycleInputUsage::isCostVerified) ? totalInputCost : null,
                usages.size(),
                usages.stream().allMatch(CycleInputUsage::isCostVerified) ? costByType : Map.of(),
                items
        );
    }

    @Override
    public void deleteInputUsage(Long farmerId, Long cycleId, Long usageId) {
        validateFarmerAccess(farmerId);

        CycleInputUsage usage = cycleInputUsageRepository.findLockedByIdAndFarmerId(usageId, farmerId)
                .filter(u -> u.getCycle().getId().equals(cycleId))
                .orElseThrow(() -> new ResourceNotFoundException("Input usage not found with id: " + usageId + " for cycle: " + cycleId));

        // Restore deducted stock back to inventory
        if (!usage.isCostVerified()) {
            throw new ConflictException("Confirm this historical usage cost before removing it and restoring stock.");
        }
        FarmInput farmInput = usage.getFarmInput() == null ? null : farmInputRepository
                .findLockedByIdAndFarmerId(usage.getFarmInput().getId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input", usage.getFarmInput().getId()));
        if (farmInput != null) {
            if (farmInput.getQuantity() > 0 && farmInput.getUnitCost() == null) {
                throw new ConflictException("Confirm the remaining inventory unit cost before restoring stock.");
            }
            double currentValue = farmInput.getQuantity() > 0 ? farmInput.getQuantity() * farmInput.getUnitCost() : 0;
            double restoredValue = usage.getQuantityUsed() * (usage.getUnitPrice() != null ? usage.getUnitPrice() : 0.0);
            double restoredStock = Math.round((farmInput.getQuantity() + usage.getQuantityUsed()) * 100.0) / 100.0;
            farmInput.setUnitCost(restoredStock > 0 ? (currentValue + restoredValue) / restoredStock : 0.0);
            farmInput.setQuantity(restoredStock);
            farmInputRepository.save(farmInput);
        }

        cycleInputUsageRepository.delete(usage);
    }

    @Override
    public CycleInputUsageResponse confirmUsageCost(Long farmerId, Long cycleId, Long usageId, Double unitCost) {
        validateFarmerAccess(farmerId);
        if (unitCost == null || !Double.isFinite(unitCost) || unitCost < 0) {
            throw new BadRequestException("Unit cost must be a finite, non-negative amount.");
        }
        CycleInputUsage usage = cycleInputUsageRepository.findLockedByIdAndFarmerId(usageId, farmerId)
                .filter(u -> u.getCycle().getId().equals(cycleId))
                .orElseThrow(() -> new ResourceNotFoundException("Input usage", usageId));
        if (usage.isCostVerified()) throw new ConflictException("This usage already has a confirmed cost.");
        usage.setUnitPrice(unitCost);
        usage.setTotalCost(Math.round(usage.getQuantityUsed() * unitCost * 100.0) / 100.0);
        usage.setCostBasisVersion(1);
        return CycleInputUsageResponse.fromEntity(cycleInputUsageRepository.save(usage));
    }

    private void validateFarmerAccess(Long farmerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin && !principal.getId().equals(farmerId)) {
                throw new UnauthorizedException("Access denied: You can only access your own cycle records.");
            }
        }
    }
}
