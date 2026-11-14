package com.farmer.tracking.modules.input.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Farm input initializer (no demo inputs are seeded).
 */
@Component
public class FarmInputDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Intentionally left empty: no mock/demo farm inputs are seeded.
    }
}
