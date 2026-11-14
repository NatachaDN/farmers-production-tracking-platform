package com.farmer.tracking.modules.input.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Farm input initializer (no demo inputs are seeded).
 */
// Demo data for local development only: never seed fake records into a real farmer account.
@Profile("local")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true")
@Component
public class FarmInputDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Intentionally left empty: no mock/demo farm inputs are seeded.
    }
}
