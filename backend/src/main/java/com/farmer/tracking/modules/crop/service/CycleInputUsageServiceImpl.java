package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.BadRequestException;
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
        Cycle cycle = cycleRepository.findById(cycleId)
                .filter(c -> c.getFarmerId().equals(farmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        // 2. Validate cycle status (must be ACTIVE)
        if (cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalArgumentException("Input consumption can only be recorded for an ACTIVE cycle. Current status is: " + cycle.getStatus());
        }

        // 3. Validate quantity
        if (request.getQuantityUsed() == null || request.getQuantityUsed() <= 0) {
            throw new IllegalArgumentException("Quantity used must be greater than 0");
        }

        // 4. Verify inventory input existence and ownership
        FarmInput farmInput = farmInputRepository.findByIdAndFarmerId(request.getInputId(), farmerId)
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

        // 6. Deduct used quantity from inventory stock (Acceptance Criterion 1)
        double remainingStock = Math.round((farmInput.getQuantity() - request.getQuantityUsed()) * 100.0) / 100.0;
        farmInput.setQuantity(remainingStock);
        farmInputRepository.save(farmInput);

        // 7. Calculate real cost based on input purchase price
        double unitPrice = (farmInput.getPurchasePrice() != null) ? farmInput.getPurchasePrice() : 0.0;
        double totalCost = Math.round((request.getQuantityUsed() * unitPrice) * 100.0) / 100.0;

        LocalDate usageDate = (request.getUsageDate() != null) ? request.getUsageDate() : LocalDate.now();

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
                totalInputCost,
                usages.size(),
                costByType,
                items
        );
    }

    @Override
    public void deleteInputUsage(Long farmerId, Long cycleId, Long usageId) {
        validateFarmerAccess(farmerId);

        CycleInputUsage usage = cycleInputUsageRepository.findByIdAndFarmerId(usageId, farmerId)
                .filter(u -> u.getCycle().getId().equals(cycleId))
                .orElseThrow(() -> new ResourceNotFoundException("Input usage not found with id: " + usageId + " for cycle: " + cycleId));

        // Restore deducted stock back to inventory
        FarmInput farmInput = usage.getFarmInput();
        if (farmInput != null) {
            double restoredStock = Math.round((farmInput.getQuantity() + usage.getQuantityUsed()) * 100.0) / 100.0;
            farmInput.setQuantity(restoredStock);
            farmInputRepository.save(farmInput);
        }

        cycleInputUsageRepository.delete(usage);
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
