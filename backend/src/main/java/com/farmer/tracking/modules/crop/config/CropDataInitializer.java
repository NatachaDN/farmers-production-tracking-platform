package com.farmer.tracking.modules.crop.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Crop initializer (no demo crops, cycles, activities, or harvests are seeded).
 */
@Component
public class CropDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Intentionally left empty: no mock/demo crop data is seeded.
    }
}
