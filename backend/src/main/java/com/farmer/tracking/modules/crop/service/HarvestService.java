package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.FarmerAccessGuard;
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
        FarmerAccessGuard.validateFarmerAccess(farmerId, "harvest");
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        if (cycle.getStatus() != CycleStatus.ACTIVE) {
            throw new IllegalStateException("Harvest can only be recorded for an ACTIVE cycle. Current status is: " + cycle.getStatus());
        }

        if (harvestRepository.existsByCycleId(cycle.getId())) {
            throw new IllegalStateException("Harvest has already been recorded for this cycle.");
        }

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

        // Update cycle status to COMPLETED and set end date
        cycle.setStatus(CycleStatus.COMPLETED);
        cycle.setEndDate(request.getHarvestDate());
        cycleRepository.save(cycle);

        return toResponse(savedHarvest, cycle, yieldDisplay);
    }

    /**
     * Updates an existing harvest record (farmer-owned only).
     * Recalculates the yield and syncs the cycle's end date.
     */
    @Transactional
    public HarvestResponse updateHarvest(Long farmerId, Long cycleId, HarvestRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "harvest");
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        Harvest harvest = harvestRepository.findByCycleId(cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No harvest record found for cycle id: " + cycleId));

        harvest.setQuantity(request.getQuantity());
        harvest.setUnit(request.getUnit());
        harvest.setHarvestDate(request.getHarvestDate());
        harvest.setNotes(request.getNotes());

        String yieldDisplay;
        if (cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            harvest.setCalculatedYield(Math.round((request.getQuantity() / cycle.getAcreage()) * 100.0) / 100.0);
            yieldDisplay = String.format("%.2f %s / ha", harvest.getCalculatedYield(), request.getUnit().name().toLowerCase());
        } else {
            harvest.setCalculatedYield(request.getQuantity());
            yieldDisplay = String.format("%.1f %s total output", harvest.getCalculatedYield(), request.getUnit().name().toLowerCase());
        }

        Harvest updated = harvestRepository.save(harvest);

        // Keep the cycle's end date in sync with the corrected harvest date
        cycle.setEndDate(request.getHarvestDate());
        cycleRepository.save(cycle);

        return toResponse(updated, cycle, yieldDisplay);
    }

    /**
     * Deletes an existing harvest record (farmer-owned only).
     * The cycle is reopened (status back to ACTIVE) so a corrected harvest can be re-recorded.
     */
    @Transactional
    public void deleteHarvest(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "harvest");
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));

        Harvest harvest = harvestRepository.findByCycleId(cycle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No harvest record found for cycle id: " + cycleId));

        harvestRepository.delete(harvest);

        // Reopen the cycle: a deleted harvest means the cycle is active again
        cycle.setStatus(CycleStatus.ACTIVE);
        cycle.setStage("Maturing");
        cycle.setSubStatus("On track");
        cycle.setEndDate(null);
        cycleRepository.save(cycle);
    }

    /**
     * Retrieves the harvest details for a cycle.
     */
    @Transactional(readOnly = true)
    public HarvestResponse getHarvestByCycle(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "harvest");
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
        response.setCreatedAt(harvest.getCreatedAt());
        response.setUpdatedAt(harvest.getUpdatedAt());
        return response;
    }
}
