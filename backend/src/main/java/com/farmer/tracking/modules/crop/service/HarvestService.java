package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
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
 * - Transitions cycle status to COMPLETED and sets end date.
 */
@Service
public class HarvestService {

    private final HarvestRepository harvestRepository;
    private final CycleRepository cycleRepository;

    public HarvestService(HarvestRepository harvestRepository, CycleRepository cycleRepository) {
        this.harvestRepository = harvestRepository;
        this.cycleRepository = cycleRepository;
    }

    /**
     * Records the harvest for an active cycle.
     */
    @Transactional
    public HarvestResponse recordHarvest(Long farmerId, Long cycleId, HarvestRequest request) {
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        if (cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalStateException("Harvest can only be recorded for an ACTIVE cycle. Current status is: " + cycle.getStatus());
        }

        if (harvestRepository.existsByCycleId(cycle.getId())) {
            throw new IllegalStateException("Harvest has already been recorded for this cycle.");
        }

        validateHarvestDate(cycle, request);

        // Create and save harvest
        Harvest harvest = new Harvest();
        harvest.setCycle(cycle);
        applyRequest(harvest, cycle, request);
        Harvest savedHarvest = harvestRepository.save(harvest);

        // Mark the cycle COMPLETED. Its end date keeps the *planned* harvest date (US-12):
        // the actual date is stored on the Harvest so both can be compared (US-17).
        cycle.setStatus(CycleStatus.COMPLETED);
        cycleRepository.save(cycle);

        return toResponse(savedHarvest, cycle, yieldDisplay(harvest, cycle));
    }

    /**
     * Corrects a recorded harvest (quantity, unit, date, details). The yield is recalculated.
     */
    @Transactional
    public HarvestResponse updateHarvest(Long farmerId, Long cycleId, HarvestRequest request) {
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
        Harvest harvest = harvestRepository.findByCycleId(cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No harvest record found for cycle id: " + cycleId));

        validateHarvestDate(cycle, request);
        applyRequest(harvest, cycle, request);
        Harvest saved = harvestRepository.save(harvest);
        return toResponse(saved, cycle, yieldDisplay(saved, cycle));
    }

    /**
     * Deletes a harvest recorded by mistake. The cycle becomes ACTIVE again so the harvest can be re-recorded.
     */
    @Transactional
    public void deleteHarvest(Long farmerId, Long cycleId) {
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
        Harvest harvest = harvestRepository.findByCycleId(cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No harvest record found for cycle id: " + cycleId));

        harvestRepository.delete(harvest);
        if (cycle.getStatus() == CycleStatus.COMPLETED) {
            cycle.setStatus(CycleStatus.ACTIVE);
            cycleRepository.save(cycle);
        }
    }

    private void validateHarvestDate(Cycle cycle, HarvestRequest request) {
        if (request.getHarvestDate() != null && cycle.getStartDate() != null
                && request.getHarvestDate().isBefore(cycle.getStartDate())) {
            throw new IllegalArgumentException("Harvest date cannot be before the cycle planting date ("
                    + cycle.getStartDate() + ").");
        }
    }

    private void applyRequest(Harvest harvest, Cycle cycle, HarvestRequest request) {
        harvest.setQuantity(request.getQuantity());
        harvest.setUnit(request.getUnit());
        harvest.setHarvestDate(request.getHarvestDate());
        harvest.setCalculatedYield(calculateYield(request.getQuantity(), cycle));
        harvest.setNotes(request.getNotes());
        harvest.setQualityGrade(trimOrNull(request.getQualityGrade()));
        harvest.setHarvestMethod(trimOrNull(request.getHarvestMethod()));
        harvest.setStorageLocation(trimOrNull(request.getStorageLocation()));
        harvest.setMoistureContentPercent(request.getMoistureContentPercent());
        harvest.setPostHarvestLossQuantity(request.getPostHarvestLossQuantity());
        harvest.setMarketDestination(trimOrNull(request.getMarketDestination()));
        harvest.setEstimatedRevenue(request.getEstimatedRevenue());
    }

    /** Yield per hectare when the acreage is known, otherwise the total output. */
    private static Double calculateYield(Double quantity, Cycle cycle) {
        if (cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            return Math.round((quantity / cycle.getAcreage()) * 100.0) / 100.0;
        }
        return quantity;
    }

    private static String yieldDisplay(Harvest harvest, Cycle cycle) {
        String unit = harvest.getUnit().name().toLowerCase();
        if (cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            return String.format("%.2f %s / ha", harvest.getCalculatedYield(), unit);
        }
        return String.format("%.1f %s total output", harvest.getCalculatedYield(), unit);
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

        return toResponse(harvest, cycle, yieldDisplay(harvest, cycle));
    }

    private HarvestResponse toResponse(Harvest harvest, Cycle cycle, String yieldDisplay) {
        HarvestResponse response = new HarvestResponse();
        response.setId(harvest.getId());
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
        response.setQualityGrade(harvest.getQualityGrade());
        response.setHarvestMethod(harvest.getHarvestMethod());
        response.setStorageLocation(harvest.getStorageLocation());
        response.setMoistureContentPercent(harvest.getMoistureContentPercent());
        response.setPostHarvestLossQuantity(harvest.getPostHarvestLossQuantity());
        response.setMarketDestination(harvest.getMarketDestination());
        response.setEstimatedRevenue(harvest.getEstimatedRevenue());
        response.setCreatedAt(harvest.getCreatedAt());
        response.setUpdatedAt(harvest.getUpdatedAt());
        return response;
    }

    private String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
