package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlotServiceImpl implements PlotService {

    private final PlotRepository plotRepository;
    private final FarmRepository farmRepository;
    private final CycleRepository cycleRepository;

    public PlotServiceImpl(PlotRepository plotRepository, FarmRepository farmRepository, CycleRepository cycleRepository) {
        this.plotRepository = plotRepository;
        this.farmRepository = farmRepository;
        this.cycleRepository = cycleRepository;
    }

    @Override
    public PlotResponse createPlot(Long farmerId, PlotRequest request) {
        if (request.getArea() == null || !Double.isFinite(request.getArea()) || request.getArea() <= 0) {
            throw new IllegalArgumentException("Area must be a positive number");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Plot name is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }

        Farm targetFarm = resolveFarm(farmerId, request.getFarmId());
        validateFarmArea(targetFarm, request.getArea(), null);

        Plot plot = new Plot(
                farmerId,
                targetFarm,
                request.getName().trim(),
                request.getArea(),
                request.getLocation().trim(),
                request.getCropType() != null ? request.getCropType().trim() : "Unspecified",
                request.getStage() != null ? request.getStage().trim() : "Planned"
        );

        Plot savedPlot = plotRepository.save(plot);
        return PlotResponse.fromEntity(savedPlot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlotResponse> getPlotsByFarmer(Long farmerId) {
        return plotRepository.findByFarmerId(farmerId).stream()
                .map(PlotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlotResponse getPlotById(Long farmerId, Long plotId) {
        Plot plot = plotRepository.findByIdAndFarmerId(plotId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot", plotId));
        return PlotResponse.fromEntity(plot);
    }

    @Override
    public PlotResponse updatePlot(Long farmerId, Long plotId, PlotRequest request) {
        if (request.getArea() == null || !Double.isFinite(request.getArea()) || request.getArea() <= 0) {
            throw new IllegalArgumentException("Area must be a positive number");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Plot name is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }

        Plot plot = plotRepository.findLockedByIdAndFarmerId(plotId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot", plotId));

        Long requestedFarm = request.getFarmId() != null ? request.getFarmId()
                : (plot.getFarm() == null ? null : plot.getFarm().getId());
        Farm targetFarm = resolveFarm(farmerId, requestedFarm);
        validateFarmArea(targetFarm, request.getArea(), plotId);
        plot.setFarm(targetFarm);
        for (Cycle cycle : cycleRepository.findByPlotId(plotId)) {
            if (cycle.getAcreage() != null && cycle.getAcreage() > request.getArea()) {
                throw new BadRequestException("Plot area cannot be smaller than an existing production cycle's area.");
            }
        }

        plot.setName(request.getName().trim());
        plot.setArea(request.getArea());
        plot.setLocation(request.getLocation().trim());
        if (request.getCropType() != null) {
            plot.setCropType(request.getCropType().trim());
        }
        if (request.getStage() != null) {
            plot.setStage(request.getStage().trim());
        }

        Plot savedPlot = plotRepository.save(plot);
        return PlotResponse.fromEntity(savedPlot);
    }

    @Override
    public void deletePlot(Long farmerId, Long plotId) {
        deletePlot(farmerId, plotId, false);
    }

    @Override
    public void deletePlot(Long farmerId, Long plotId, boolean force) {
        Plot plot = plotRepository.findLockedByIdAndFarmerId(plotId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot", plotId));

        Optional<Cycle> activeCycle = cycleRepository.findFirstByPlotIdAndStatusOrderByIdDesc(plotId, CycleStatus.ACTIVE);
        if (activeCycle.isPresent() && !force) {
            throw new ConflictException("Cannot delete plot '" + plot.getName() + "' because it is linked to active production cycle '"
                    + activeCycle.get().getName() + "'. Complete or cancel the cycle first, or confirm forced deletion.");
        }

        List<Cycle> linkedCycles = cycleRepository.findByPlotId(plotId);
        if (linkedCycles != null && !linkedCycles.isEmpty()) {
            for (Cycle c : linkedCycles) {
                c.setPlot(null);
            }
            cycleRepository.saveAll(linkedCycles);
        }

        plotRepository.delete(plot);
    }

    private Farm resolveFarm(Long farmerId, Long requestedId) {
        Long id = requestedId;
        if (id == null) {
            id = farmRepository.findFirstByFarmerIdAndIsDefaultTrue(farmerId)
                    .map(Farm::getId).orElseThrow(() -> new BadRequestException("Create a farm before registering a plot."));
        }
        return farmRepository.findLockedByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found for this farmer."));
    }

    private void validateFarmArea(Farm farm, Double area, Long excludeId) {
        double capacity = farm.getSizeUnit() == SizeUnit.ACRES ? farm.getSize() * 0.40468564224 : farm.getSize();
        Double otherArea = plotRepository.totalAreaInFarm(farm.getId(), excludeId);
        if ((otherArea == null ? 0 : otherArea) + area > capacity + 0.000001) {
            throw new BadRequestException("Combined plot area cannot exceed the farm's registered area.");
        }
    }
}
