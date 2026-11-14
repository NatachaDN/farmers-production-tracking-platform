package com.farmer.tracking.modules.plot.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Plot initializer (no demo plots are seeded; farmers start with an empty plot
 * list).
 */
@Component
public class PlotDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Intentionally left empty: no mock/demo plots are seeded.
    }
}
