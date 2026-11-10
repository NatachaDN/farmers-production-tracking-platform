package com.farmer.tracking.modules.dashboard.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.dashboard.api.FarmerDashboardResponse;
import com.farmer.tracking.modules.dashboard.api.FarmerDashboardResponse.*;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class FarmerDashboardService {

    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final CycleRepository cycleRepository;
    private final HarvestRepository harvestRepository;
    private final CycleActivityRepository activityRepository;
    private final FarmInputRepository inputRepository;
    private final AnimalGroupRepository animalGroupRepository;

    public FarmerDashboardService(
            FarmerRepository farmerRepository,
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            CycleRepository cycleRepository,
            HarvestRepository harvestRepository,
            CycleActivityRepository activityRepository,
            FarmInputRepository inputRepository,
            AnimalGroupRepository animalGroupRepository
    ) {
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.cycleRepository = cycleRepository;
        this.harvestRepository = harvestRepository;
        this.activityRepository = activityRepository;
        this.inputRepository = inputRepository;
        this.animalGroupRepository = animalGroupRepository;
    }

    public FarmerDashboardResponse getDashboardSummary(Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + farmerId));

        String farmerName = (farmer.getFullName() != null && !farmer.getFullName().isBlank())
                ? farmer.getFullName()
                : (farmer.getEmailOrPhone() != null ? farmer.getEmailOrPhone().split("@")[0] : "Farmer");

        List<Farm> farms = farmRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        String farmName = farms.stream()
                .filter(Farm::isDefault)
                .map(Farm::getName)
                .findFirst()
                .orElseGet(() -> !farms.isEmpty() ? farms.get(0).getName() : (farmer.getFarmName() != null ? farmer.getFarmName() : "My Farm"));

        List<Cycle> allCycles = cycleRepository.findByFarmerId(farmerId);
        int activeCyclesCount = (int) allCycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count();
        int completedCyclesCount = (int) allCycles.stream().filter(c -> c.getStatus() == CycleStatus.COMPLETED).count();

        List<Plot> plots = plotRepository.findByFarmerId(farmerId);
        int plotsCount = plots.size();
        double totalAreaHa = plots.stream()
                .mapToDouble(p -> p.getArea() != null ? p.getArea() : 0.0)
                .sum();
        totalAreaHa = Math.round(totalAreaHa * 100.0) / 100.0;

        List<Harvest> harvests = harvestRepository.findByFarmerIdOrderByHarvestDateDesc(farmerId);
        double totalHarvestKg = harvests.stream().mapToDouble(FarmerDashboardService::toKg).sum();
        totalHarvestKg = Math.round(totalHarvestKg * 10.0) / 10.0;
        int harvestCount = harvests.size();

        List<FarmInput> inputs = inputRepository.findByFarmerId(farmerId);
        int totalInputsCount = inputs.size();
        double totalInputsCost = inputs.stream()
                .mapToDouble(i -> i.getCumulativeCost() != null ? i.getCumulativeCost() : (i.getPurchasePrice() != null ? i.getPurchasePrice() : 0.0))
                .sum();

        List<CycleActivity> activities = activityRepository.findByFarmerIdOrderByActivityDateDesc(farmerId);
        int activitiesCount = activities.size();

        // 5 most recent activities
        List<RecentActivityItem> recentActivities = activities.stream()
                .limit(5)
                .map(a -> new RecentActivityItem(
                        a.getId(),
                        a.getCycle() != null ? a.getCycle().getId() : null,
                        a.getCycle() != null ? a.getCycle().getName() : "Cycle",
                        a.getCycle() != null ? a.getCycle().getCropName() : null,
                        (a.getCycle() != null && a.getCycle().getPlot() != null) ? a.getCycle().getPlot().getName() : "Plot",
                        a.getActivityType() != null ? a.getActivityType().name() : "ACTIVITY",
                        a.getActivityDate(),
                        a.getNotes()
                ))
                .toList();

        // Upcoming activities: scheduled interventions or active cycles planned harvests
        LocalDate today = LocalDate.now();
        List<UpcomingActivityItem> upcoming = new ArrayList<>();

        // 1. Future planned activities in activities table
        for (CycleActivity a : activities) {
            if (a.getActivityDate() != null && !a.getActivityDate().isBefore(today)) {
                String title = formatActivityTitle(a);
                String location = (a.getCycle() != null && a.getCycle().getPlot() != null) ? a.getCycle().getPlot().getName() : "Farm";
                upcoming.add(new UpcomingActivityItem(
                        a.getId(),
                        title,
                        location,
                        a.getActivityDate().toString(),
                        a.getActivityType() != null ? a.getActivityType().name() : "ACTIVITY"
                ));
            }
        }

        // 2. Upcoming planned harvest dates for active cycles
        for (Cycle c : allCycles) {
            if (c.getStatus() == CycleStatus.ACTIVE && c.getEndDate() != null && !c.getEndDate().isBefore(today)) {
                String location = c.getPlot() != null ? c.getPlot().getName() : "Plot";
                upcoming.add(new UpcomingActivityItem(
                        c.getId(),
                        "Harvest — " + (c.getCropName() != null ? c.getCropName() : c.getName()),
                        location,
                        c.getEndDate().toString(),
                        "HARVEST"
                ));
            }
        }

        upcoming.sort(Comparator.comparing(UpcomingActivityItem::dateOrTime));
        if (upcoming.size() > 5) {
            upcoming = upcoming.subList(0, 5);
        }

        // Monthly production across last 12 months
        List<MonthlyProductionItem> monthlyProduction = new ArrayList<>();
        YearMonth currentYm = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            double sumMonthKg = harvests.stream()
                    .filter(h -> h.getHarvestDate() != null && YearMonth.from(h.getHarvestDate()).equals(ym))
                    .mapToDouble(FarmerDashboardService::toKg)
                    .sum();
            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthlyProduction.add(new MonthlyProductionItem(monthName, Math.round(sumMonthKg * 10.0) / 10.0));
        }

        int animalGroupsCount = (int) animalGroupRepository.countByFarmerId(farmerId);
        long totalAnimalPopulation = animalGroupRepository.sumActivePopulationByFarmerId(farmerId);

        return new FarmerDashboardResponse(
                farmerName,
                farmName,
                activeCyclesCount,
                completedCyclesCount,
                allCycles.size(),
                plotsCount,
                totalAreaHa,
                farms.size(),
                totalHarvestKg,
                harvestCount,
                totalInputsCount,
                totalInputsCost,
                activitiesCount,
                animalGroupsCount,
                totalAnimalPopulation,
                recentActivities,
                upcoming,
                monthlyProduction
        );
    }

    private static String formatActivityTitle(CycleActivity a) {
        String type = a.getActivityType() != null ? a.getActivityType().name() : "Activity";
        type = type.charAt(0) + type.substring(1).toLowerCase();
        String crop = (a.getCycle() != null && a.getCycle().getCropName() != null) ? a.getCycle().getCropName() : "";
        return crop.isBlank() ? type : type + " — " + crop;
    }

    private static double toKg(Harvest h) {
        if (h == null || h.getQuantity() == null) return 0.0;
        if (h.getUnit() == null) return h.getQuantity();
        return switch (h.getUnit()) {
            case KG -> h.getQuantity();
            case TONS -> h.getQuantity() * 1000.0;
            case BAGS -> h.getQuantity() * 50.0;
        };
    }
}
