package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlotServiceImpl implements PlotService {

    private final PlotRepository plotRepository;

    public PlotServiceImpl(PlotRepository plotRepository) {
        this.plotRepository = plotRepository;
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

        Plot plot = new Plot(
                farmerId,
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
}
