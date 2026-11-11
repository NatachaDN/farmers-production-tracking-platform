package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.HarvestCorrectionRequest;
import com.farmer.tracking.modules.crop.entity.HarvestCorrection;
import com.farmer.tracking.modules.crop.entity.HarvestValues;
import com.farmer.tracking.modules.crop.repository.HarvestCorrectionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import com.farmer.tracking.common.util.ProductionRules;
import com.farmer.tracking.modules.crop.api.HarvestRequest;
import com.farmer.tracking.modules.crop.api.HarvestResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling business rules for crop harvests:
 * - Validates farmer ownership and active cycle status.
 * - Records harvested quantity, unit, and date.
 * - Calculates actual yield based on quantity and acreage.
 * - Completes the cycle while preserving its planned harvest date.
 * - Corrects recorded harvests with immutable before/after history and stale-edit protection.
 */
@Service
public class HarvestService {

    private final HarvestRepository harvestRepository;
    private final CycleRepository cycleRepository;
    private final HarvestCorrectionRepository correctionRepository;

    public HarvestService(HarvestRepository harvestRepository, CycleRepository cycleRepository, HarvestCorrectionRepository correctionRepository) {
        this.harvestRepository = harvestRepository;
        this.cycleRepository = cycleRepository;
        this.correctionRepository = correctionRepository;
    }

    /**
     * Records the harvest for an active cycle.
     */
    @Transactional
    public HarvestResponse recordHarvest(Long farmerId, Long cycleId, HarvestRequest request) {
        Cycle cycle = cycleRepository.findLockedByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        if (cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalStateException("Harvest can only be recorded for an ACTIVE cycle. Current status is: " + cycle.getStatus());
        }

        if (harvestRepository.existsByCycleId(cycle.getId())) {
            throw new IllegalStateException("Harvest has already been recorded for this cycle.");
        }

        ProductionRules.eventDate(cycle, request.getHarvestDate());
        ProductionRules.positiveFinite(request.getQuantity(), "Harvest quantity");
        // Calculate yield
        Double calculatedYield;
        String yieldDisplay;
        if (cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            calculatedYield = Math.round((request.getQuantity() / cycle.getAcreage()) * 100.0) / 100.0;
            yieldDisplay = String.format("%.2f %s / ha", calculatedYield, request.getUnit().name().toLowerCase());
        } else {
            calculatedYield = request.getQuantity();
            yieldDisplay = String.format("%.1f %s total output", calculatedYield, request.getUnit().name().toLowerCase());
        }

        // Create and save harvest
        Harvest harvest = new Harvest();
        harvest.setCycle(cycle);
        harvest.setQuantity(request.getQuantity());
        harvest.setUnit(request.getUnit());
        harvest.setHarvestDate(request.getHarvestDate());
        harvest.setCalculatedYield(calculatedYield);
        harvest.setNotes(request.getNotes());
        Harvest savedHarvest = harvestRepository.save(harvest);

        // Mark the cycle COMPLETED. Its end date keeps the *planned* harvest date (US-12):
        // the actual date is stored on the Harvest so both can be compared (US-17).
        cycle.setStatus(CycleStatus.COMPLETED);
        cycle.setProgress(100);
        cycle.setSubStatus("Completed");
        cycleRepository.save(cycle);

        return toResponse(savedHarvest, cycle, yieldDisplay);
    }

    /**
     * Retrieves the harvest details for a cycle.
     */
    @Transactional(readOnly = true)
    public HarvestResponse getHarvestByCycle(Long farmerId, Long cycleId) {
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        Harvest harvest = harvestRepository.findByCycleId(cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No harvest record found for cycle id: " + cycleId));

        String yieldDisplay;
        if (cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            yieldDisplay = String.format("%.2f %s / ha", harvest.getCalculatedYield(), harvest.getUnit().name().toLowerCase());
        } else {
            yieldDisplay = String.format("%.1f %s total output", harvest.getCalculatedYield(), harvest.getUnit().name().toLowerCase());
        }

        return toResponse(harvest, cycle, yieldDisplay);
    }

    @Transactional
    public HarvestResponse correctHarvest(Long farmerId, Long cycleId, HarvestCorrectionRequest request) {
        Cycle cycle = cycleRepository.findLockedByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", cycleId));
        Harvest harvest = harvestRepository.findByCycleId(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("No harvest recorded for this cycle."));
        if (cycle.getStatus() != CycleStatus.COMPLETED) throw new ConflictException("Only a completed cycle's harvest can be corrected.");
        if (request.getExpectedRevision() == null || harvest.getRevision() != request.getExpectedRevision()) {
            throw new ConflictException("This harvest has changed. Reload it and review the latest values before saving.");
        }
        if (request.getReason() == null || request.getReason().isBlank()) throw new BadRequestException("A correction reason is required.");
        ProductionRules.positiveFinite(request.getQuantity(), "Harvest quantity");
        ProductionRules.eventDate(cycle, request.getHarvestDate());
        HarvestValues before = new HarvestValues(harvest);
        harvest.setQuantity(request.getQuantity()); harvest.setUnit(request.getUnit());
        harvest.setHarvestDate(request.getHarvestDate()); harvest.setNotes(request.getNotes());
        harvest.setCalculatedYield(cycle.getAcreage() != null && cycle.getAcreage() > 0
                ? Math.round(request.getQuantity() / cycle.getAcreage() * 100.0) / 100.0 : request.getQuantity());
        harvest.setRevision(harvest.getRevision() + 1);
        harvestRepository.save(harvest);
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Long actorId = authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal ? principal.getId() : farmerId;
        correctionRepository.save(new HarvestCorrection(harvest, before, request.getReason().trim(), actorId));
        String display = cycle.getAcreage() != null && cycle.getAcreage() > 0
                ? String.format("%.2f %s / ha", harvest.getCalculatedYield(), harvest.getUnit().name().toLowerCase())
                : String.format("%.1f %s total output", harvest.getCalculatedYield(), harvest.getUnit().name().toLowerCase());
        return toResponse(harvest, cycle, display);
    }

    @Transactional(readOnly = true)
    public List<HarvestCorrection> getCorrections(Long farmerId, Long cycleId) {
        cycleRepository.findByIdAndFarmerId(cycleId, farmerId).orElseThrow(() -> new ResourceNotFoundException("Cycle", cycleId));
        Harvest harvest = harvestRepository.findByCycleId(cycleId).orElseThrow(() -> new ResourceNotFoundException("No harvest recorded for this cycle."));
        return correctionRepository.findByHarvest_IdOrderByRevisionDesc(harvest.getId());
    }

    private HarvestResponse toResponse(Harvest harvest, Cycle cycle, String yieldDisplay) {
        HarvestResponse response = new HarvestResponse();
        response.setId(harvest.getId());
        response.setRevision(harvest.getRevision());
        response.setCycleId(cycle.getId());
        response.setCycleName(cycle.getName());
        response.setCycleStatus(cycle.getStatus());
        response.setQuantity(harvest.getQuantity());
        response.setUnit(harvest.getUnit());
        response.setHarvestDate(harvest.getHarvestDate());
        response.setAcreage(cycle.getAcreage());
        response.setCalculatedYield(harvest.getCalculatedYield());
        response.setYieldDisplay(yieldDisplay);
        response.setNotes(harvest.getNotes());
        response.setCreatedAt(harvest.getCreatedAt());
        response.setUpdatedAt(harvest.getUpdatedAt());
        return response;
    }
}
