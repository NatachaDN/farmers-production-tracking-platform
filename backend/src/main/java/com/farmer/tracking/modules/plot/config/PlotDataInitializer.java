package com.farmer.tracking.modules.plot.config;

import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds initial demo plot data for farmer ID 1.
 * Only runs when the plots table is empty.
 */
@Component
public class PlotDataInitializer implements CommandLineRunner {

    private final PlotRepository plotRepository;

    public PlotDataInitializer(PlotRepository plotRepository) {
        this.plotRepository = plotRepository;
    }

    @Override
    public void run(String... args) {
        if (plotRepository.count() == 0) {
            plotRepository.save(new Plot(1L, "Plot A — Maize", 2.5, "North Field, Section 1", "Maize", "Vegetative growth"));
            plotRepository.save(new Plot(1L, "Plot B — Tomatoes", 1.0, "East Field, Block B", "Tomatoes", "Flowering"));
            plotRepository.save(new Plot(1L, "Plot C — Beans", 0.8, "South Plot, Zone 2", "Beans", "Planting"));
            plotRepository.save(new Plot(1L, "Plot D — Cassava", 2.0, "West Plot, Hillside", "Cassava", "Maturing"));
        }
    }
}
