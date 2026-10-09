package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.entity.Farm;
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

    public PlotServiceImpl(PlotRepository plotRepository, FarmRepository farmRepository) {
        this.plotRepository = plotRepository;
        this.farmRepository = farmRepository;
    }

    @Override
    public PlotResponse createPlot(Long farmerId, PlotRequest request) {
        if (request.getArea() == null || request.getArea() <= 0) {
            throw new IllegalArgumentException("Area must be a positive number");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Plot name is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }

        Farm targetFarm = null;
        if (request.getFarmId() != null) {
            targetFarm = farmRepository.findByIdAndFarmerId(request.getFarmId(), farmerId)
                    .orElse(null);
        }
        if (targetFarm == null) {
            targetFarm = farmRepository.findFirstByFarmerIdAndIsDefaultTrue(farmerId)
                    .orElse(null);
        }

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
    public void deletePlot(Long farmerId, Long plotId) {
        Plot plot = plotRepository.findByIdAndFarmerId(plotId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot", plotId));
        plotRepository.delete(plot);
    }
}
