package com.farmer.tracking.modules.crop.config;

import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds initial demo crop cycle and activity data for development.
 */
@Component
public class CropDataInitializer implements CommandLineRunner {

    private final CycleRepository cycleRepository;
    private final CycleActivityRepository activityRepository;

    public CropDataInitializer(CycleRepository cycleRepository, CycleActivityRepository activityRepository) {
        this.cycleRepository = cycleRepository;
        this.activityRepository = activityRepository;
    }

    @Override
    public void run(String... args) {
        if (cycleRepository.count() == 0) {
            Cycle cycle = new Cycle();
            cycle.setFarmerId(1L);
            cycle.setName("Maize Production (Field A)");
            cycle.setStatus(CycleStatus.ACTIVE);
            cycle.setStartDate(LocalDate.now().minusDays(30));
            Cycle savedCycle = cycleRepository.save(cycle);

            // Seed sample interventions
            CycleActivity a1 = new CycleActivity();
            a1.setCycle(savedCycle);
            a1.setActivityType(ActivityType.WATERING);
            a1.setActivityDate(LocalDate.now().minusDays(5));
            a1.setNotes("Drip irrigation morning cycle - 45 mins");
            activityRepository.save(a1);

            CycleActivity a2 = new CycleActivity();
            a2.setCycle(savedCycle);
            a2.setActivityType(ActivityType.FERTILIZING);
            a2.setActivityDate(LocalDate.now().minusDays(2));
            a2.setNotes("Applied NPK 15-15-15 organic blend at row roots");
            activityRepository.save(a2);
        }
    }
}
