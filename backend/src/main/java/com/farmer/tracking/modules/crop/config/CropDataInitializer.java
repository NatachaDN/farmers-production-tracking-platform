package com.farmer.tracking.modules.crop.config;

import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds initial demo crop cycle, activity, and harvest data for development.
 * Only runs when the cycles table is empty.
 */
@Component
public class CropDataInitializer implements CommandLineRunner {

    private final CycleRepository cycleRepository;
    private final CycleActivityRepository activityRepository;
    private final HarvestRepository harvestRepository;

    public CropDataInitializer(CycleRepository cycleRepository,
                                CycleActivityRepository activityRepository,
                                HarvestRepository harvestRepository) {
        this.cycleRepository = cycleRepository;
        this.activityRepository = activityRepository;
        this.harvestRepository = harvestRepository;
    }

    @Override
    public void run(String... args) {
        if (cycleRepository.count() == 0) {
            // --- Seed 1: ACTIVE cycle (for activity tracking & harvesting) ---
            Cycle activeCycle = new Cycle();
            activeCycle.setFarmerId(1L);
            activeCycle.setName("Maize Production (Field A)");
            activeCycle.setStatus(CycleStatus.ACTIVE);
            activeCycle.setAcreage(2.5);
            activeCycle.setStartDate(LocalDate.now().minusDays(90));
            Cycle savedActive = cycleRepository.save(activeCycle);

            // Seed sample interventions on active cycle
            CycleActivity a1 = new CycleActivity();
            a1.setCycle(savedActive);
            a1.setActivityType(ActivityType.WATERING);
            a1.setActivityDate(LocalDate.now().minusDays(5));
            a1.setNotes("Drip irrigation morning cycle - 45 mins");
            activityRepository.save(a1);

            CycleActivity a2 = new CycleActivity();
            a2.setCycle(savedActive);
            a2.setActivityType(ActivityType.FERTILIZING);
            a2.setActivityDate(LocalDate.now().minusDays(2));
            a2.setNotes("Applied NPK 15-15-15 organic blend at row roots");
            activityRepository.save(a2);

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
