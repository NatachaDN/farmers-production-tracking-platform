package com.farmer.tracking.modules.input.config;

import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds initial demo farm input data for farmer ID 1.
 * Only runs when the farm_inputs table is empty.
 */
@Component
public class FarmInputDataInitializer implements CommandLineRunner {

    private final FarmInputRepository farmInputRepository;

    public FarmInputDataInitializer(FarmInputRepository farmInputRepository) {
        this.farmInputRepository = farmInputRepository;
    }

    @Override
    public void run(String... args) {
        if (farmInputRepository.count() == 0) {
            farmInputRepository.save(new FarmInput(
                    1L, "Maize Hybrid Seeds (DH04)", InputType.SEEDS,
                    50.0, "kg",
                    LocalDate.now().minusDays(30), 4500.0, 4500.0
            ));
            farmInputRepository.save(new FarmInput(
                    1L, "NPK 15-15-15 Fertilizer", InputType.FERTILIZER,
                    200.0, "kg",
                    LocalDate.now().minusDays(20), 12000.0, 12000.0
            ));
            farmInputRepository.save(new FarmInput(
                    1L, "Dimethoate Pesticide", InputType.PESTICIDE,
                    10.0, "litres",
                    LocalDate.now().minusDays(15), 2800.0, 2800.0
            ));
        }
    }
}
