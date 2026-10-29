package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.FarmerAccessGuard;
import com.farmer.tracking.modules.crop.api.CycleRequest;
import com.farmer.tracking.modules.crop.api.CycleResponse;
import com.farmer.tracking.modules.crop.api.PlotConflictCheckResponse;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service managing Crop Production Cycles:
 * - Creates cycles with plot selection, crop name, planting date, expected quantity, and planned harvest date.
 * - Enforces plot collision / active conflict checks and warnings.
 * - Stores targets for future actual harvest comparison.
 * - Guarantees farmer isolation and security.
 */
@Service
public class CycleService {

    private final CycleRepository cycleRepository;
    private final PlotRepository plotRepository;
    private final HarvestRepository harvestRepository;

    public CycleService(CycleRepository cycleRepository, PlotRepository plotRepository, HarvestRepository harvestRepository) {
        this.cycleRepository = cycleRepository;
        this.plotRepository = plotRepository;
        this.harvestRepository = harvestRepository;
    }

    /**
     * Creates a new production cycle for the given farmer and plot.
     */
    @Transactional
    public CycleResponse createCycle(Long farmerId, CycleRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "production cycle");
        // 1. Verify Plot ownership
        Plot plot = plotRepository.findByIdAndFarmerId(request.getPlotId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot not found with id: " + request.getPlotId() + " for farmer: " + farmerId));

        // 2. Check for active plot collision / conflict
        Optional<Cycle> existingActive = cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plot.getId(), CycleStatus.ACTIVE);
        if (existingActive.isPresent() && !Boolean.TRUE.equals(request.getAllowConflict())) {
            Cycle active = existingActive.get();
            throw new ConflictException(String.format(
                    "Plot '%s' is already occupied by active cycle '%s' (crop: %s). Please complete or archive the current cycle first, or confirm to proceed.",
                    plot.getName(), active.getName(), active.getCropName() != null ? active.getCropName() : "Crop"
            ));
        }

        // 3. Build cycle name and parameters
        String cycleName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName().trim()
                : request.getCropName() + " — " + plot.getName();

        Double acreage = request.getAcreage() != null ? request.getAcreage() : plot.getArea();
        String stage = (request.getStage() != null && !request.getStage().isBlank()) ? request.getStage() : "Planting";
        String unit = (request.getExpectedQuantityUnit() != null && !request.getExpectedQuantityUnit().isBlank())
                ? request.getExpectedQuantityUnit()
                : "kg";

        // Calculate initial progress based on dates if planned harvest date is present
        int progress = calculateProgress(request.getPlantingDate(), request.getPlannedHarvestDate());

        Cycle cycle = new Cycle();
        cycle.setFarmerId(farmerId);
        cycle.setPlot(plot);
        cycle.setCropName(request.getCropName());
        cycle.setName(cycleName);
        cycle.setStartDate(request.getPlantingDate());
        cycle.setEndDate(request.getPlannedHarvestDate());
        cycle.setExpectedQuantity(request.getExpectedQuantity());
        cycle.setExpectedQuantityUnit(unit);
        cycle.setAcreage(acreage);
        cycle.setStatus(CycleStatus.ACTIVE);
        cycle.setStage(stage);
        cycle.setProgress(progress);
        cycle.setSubStatus("On track");

        Cycle saved = cycleRepository.save(cycle);

        // Update plot's current crop and stage
        plot.setCropType(request.getCropName());
        plot.setStage(stage);
        plotRepository.save(plot);

        return CycleResponse.fromEntity(saved);
    }

    /**
     * Lists all cycles for a farmer, optionally filtered by status, sorted by cycle date (newest first).
     */
    @Transactional(readOnly = true)
    public List<CycleResponse> getCyclesByFarmer(Long farmerId, CycleStatus status) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "production cycle");
        List<Cycle> cycles = (status != null)
                ? cycleRepository.findByFarmerIdAndStatus(farmerId, status)
                : cycleRepository.findByFarmerId(farmerId);

        return cycles.stream()
                .sorted(Comparator.comparing(CycleService::effectiveCycleDate)
                        .thenComparing(cycle -> cycle.getId() != null ? cycle.getId() : 0L)
                        .reversed())
                .map(CycleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private static LocalDate effectiveCycleDate(Cycle cycle) {
        if (cycle.getStartDate() != null) {
            return cycle.getStartDate();
        }
        if (cycle.getCreatedAt() != null) {
            return cycle.getCreatedAt().toLocalDate();
        }
        return LocalDate.MIN;
    }

    /**
     * Retrieves a single cycle by ID ensuring farmer ownership.
     */
    @Transactional(readOnly = true)
    public CycleResponse getCycleById(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "production cycle");
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
        Harvest harvest = harvestRepository.findByCycleId(cycleId).orElse(null);
        return CycleResponse.fromEntity(cycle, harvest);
    }

    /**
     * Checks if a plot is currently occupied by an active cycle and returns a conflict summary.
     */
    @Transactional(readOnly = true)
    public PlotConflictCheckResponse checkPlotAvailability(Long farmerId, Long plotId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "production cycle");
        Plot plot = plotRepository.findByIdAndFarmerId(plotId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot not found with id: " + plotId + " for farmer: " + farmerId));

        Optional<Cycle> existingActive = cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plot.getId(), CycleStatus.ACTIVE);
        if (existingActive.isPresent()) {
            Cycle active = existingActive.get();
            return PlotConflictCheckResponse.conflict(
                    active.getId(),
                    active.getName(),
                    active.getCropName() != null ? active.getCropName() : "Unknown",
                    plot.getName()
            );
        }
        return PlotConflictCheckResponse.noConflict();
    }

    /**
     * Deletes a production cycle ensuring farmer ownership.
     */
    @Transactional
    public void deleteCycle(Long farmerId, Long cycleId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "production cycle");
        Cycle cycle = cycleRepository.findByIdAndFarmerId(cycleId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found with id: " + cycleId + " for farmer: " + farmerId));
        cycleRepository.delete(cycle);
    }

    private int calculateProgress(LocalDate plantingDate, LocalDate plannedHarvestDate) {
        if (plantingDate == null || plannedHarvestDate == null) {
            return 0;
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(plantingDate)) {
            return 0;
        }
        if (today.isAfter(plannedHarvestDate) || today.isEqual(plannedHarvestDate)) {
            return 95;
        }
        long totalDays = ChronoUnit.DAYS.between(plantingDate, plannedHarvestDate);
        if (totalDays <= 0) {
            return 50;
        }
        long elapsedDays = ChronoUnit.DAYS.between(plantingDate, today);
        int percentage = (int) Math.round(((double) elapsedDays / totalDays) * 100.0);
        return Math.max(0, Math.min(percentage, 95));
    }
}
