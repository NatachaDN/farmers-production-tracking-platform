package com.farmer.tracking.modules.plot.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Plot initializer (no demo plots are seeded; farmers start with an empty plot
 * list).
 */
// Demo data for local development only: never seed fake records into a real farmer account.
@Profile("local")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true")
@Component
public class PlotDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Intentionally left empty: no mock/demo plots are seeded.
    }
}
