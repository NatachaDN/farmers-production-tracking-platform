package com.farmer.tracking.modules.plot.service;

import com.farmer.tracking.modules.plot.api.PlotRequest;
import com.farmer.tracking.modules.plot.api.PlotResponse;

import java.util.List;

public interface PlotService {

    PlotResponse createPlot(Long farmerId, PlotRequest request);

    List<PlotResponse> getPlotsByFarmer(Long farmerId);

    PlotResponse getPlotById(Long farmerId, Long plotId);
}
