package com.farmer.tracking.modules.crop.config;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds initial demo crop cycle and harvest data for development.
 * Only runs when the cycles table is empty to avoid duplicate entries.
 */
@Component
public class CropDataInitializer implements CommandLineRunner {

    private final CycleRepository cycleRepository;
    private final HarvestRepository harvestRepository;

    public CropDataInitializer(CycleRepository cycleRepository,
                               HarvestRepository harvestRepository) {
        this.cycleRepository = cycleRepository;
        this.harvestRepository = harvestRepository;
    }

    @Override
    public void run(String... args) {
        if (cycleRepository.count() == 0) {

            // --- Seed 1: ACTIVE cycle (ready to be harvested) ---
            Cycle activeCycle = new Cycle();
            activeCycle.setFarmerId(1L);
            activeCycle.setName("Maize Production (Field A)");
            activeCycle.setStatus(CycleStatus.ACTIVE);
            activeCycle.setAcreage(2.5);
            activeCycle.setStartDate(LocalDate.now().minusDays(90));
            cycleRepository.save(activeCycle);

            // --- Seed 2: COMPLETED cycle with a harvest record ---
            Cycle completedCycle = new Cycle();
            completedCycle.setFarmerId(1L);
            completedCycle.setName("Rice Season 2025 (Field B)");
            completedCycle.setStatus(CycleStatus.COMPLETED);
            completedCycle.setAcreage(1.8);
            completedCycle.setStartDate(LocalDate.now().minusDays(180));
            completedCycle.setEndDate(LocalDate.now().minusDays(10));
            Cycle savedCompleted = cycleRepository.save(completedCycle);

            Harvest harvest = new Harvest();
            harvest.setCycle(savedCompleted);
            harvest.setQuantity(900.0);
            harvest.setUnit(HarvestUnit.KG);
            harvest.setHarvestDate(LocalDate.now().minusDays(10));
            harvest.setCalculatedYield(Math.round((900.0 / 1.8) * 100.0) / 100.0); // 500.0 kg/ha
            harvest.setNotes("Good season — uniform grain size, minimal pest impact.");
            harvestRepository.save(harvest);
        }
    }
}
