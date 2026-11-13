package com.farmer.tracking.modules.summary;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.modules.crop.entity.*;
import com.farmer.tracking.modules.crop.repository.*;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import static com.farmer.tracking.modules.summary.SummaryResponse.*;

@Service
@Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
public class SummaryService {
    private final FarmRepository farms;
    private final PlotRepository plots;
    private final CycleRepository cycles;
    private final HarvestRepository harvests;
    private final CycleActivityRepository activities;
    private final CycleInputUsageRepository usages;

    public SummaryService(FarmRepository farms, PlotRepository plots, CycleRepository cycles,
            HarvestRepository harvests, CycleActivityRepository activities, CycleInputUsageRepository usages) {
        this.farms = farms; this.plots = plots; this.cycles = cycles;
        this.harvests = harvests; this.activities = activities; this.usages = usages;
    }

    public SummaryResponse get(Long farmerId, Long farmId) {
        var ownedFarms = farms.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        if (farmId != null && ownedFarms.stream().noneMatch(f -> farmId.equals(f.getId()))) {
            throw new ResourceNotFoundException("Farm", farmId);
        }
        var selectedPlots = plots.findByFarmerId(farmerId).stream()
                .filter(p -> farmId == null || p.getFarm() != null && farmId.equals(p.getFarm().getId())).toList();
        var plotIds = selectedPlots.stream().map(p -> p.getId()).collect(Collectors.toSet());
        var selectedCycles = cycles.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .filter(c -> farmId == null || c.getPlot() != null && plotIds.contains(c.getPlot().getId())).toList();
        var cycleIds = selectedCycles.stream().map(Cycle::getId).collect(Collectors.toSet());
        var selectedHarvests = harvests.findByCycle_FarmerId(farmerId).stream()
                .filter(h -> cycleIds.contains(h.getCycle().getId())).toList();
        var selectedUsages = usages.findByFarmerIdOrderByUsageDateDesc(farmerId).stream()
                .filter(u -> cycleIds.contains(u.getCycle().getId())).toList();
        long unverified = selectedUsages.stream().filter(u -> !u.isCostVerified()).count();
        var active = selectedCycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).toList();
        var recent = activities.findByCycle_FarmerId(farmerId).stream()
                .filter(a -> cycleIds.contains(a.getCycle().getId()))
                .sorted(Comparator.comparing(CycleActivity::getActivityDate).reversed()
                        .thenComparing(CycleActivity::getId, Comparator.reverseOrder()))
                .limit(6).map(a -> new Activity(a.getId(), a.getCycle().getId(), a.getCycle().getName(),
                        a.getActivityType().name(), a.getActivityDate(), a.getNotes())).toList();
        // These are harvest plans, not scheduled field activities (which the app does not store).
        var upcoming = active.stream().filter(c -> c.getEndDate() != null)
                .sorted(Comparator.comparing(Cycle::getEndDate).thenComparing(Cycle::getId)).limit(6)
                .map(c -> new PlannedHarvest(c.getId(), c.getName(), c.getEndDate())).toList();
        var monthly = new ArrayList<MonthlyHarvest>();
        YearMonth current = YearMonth.from(LocalDate.now());
        for (int i = 11; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            var rows = selectedHarvests.stream().filter(h -> YearMonth.from(h.getHarvestDate()).equals(month)).toList();
            monthly.add(new MonthlyHarvest(month.toString(), round(rows.stream().mapToDouble(SummaryService::kg).sum()),
                    round(rows.stream().mapToDouble(SummaryService::bags).sum())));
        }
        Map<String, Double> cropAreas = new TreeMap<>();
        selectedPlots.forEach(p -> cropAreas.merge(p.getCropType() == null || p.getCropType().isBlank()
                ? "Unspecified" : p.getCropType(), p.getArea(), Double::sum));
        return new SummaryResponse(farmId == null ? ownedFarms.size() : 1, selectedPlots.size(),
                round(selectedPlots.stream().mapToDouble(p -> p.getArea()).sum()), active.size(),
                active.stream().map(Cycle::getCropName).filter(Objects::nonNull).map(s -> s.trim().toLowerCase(Locale.ROOT)).distinct().count(),
                round(selectedHarvests.stream().mapToDouble(SummaryService::kg).sum()),
                round(selectedHarvests.stream().mapToDouble(SummaryService::bags).sum()), selectedHarvests.size(),
                unverified == 0 ? round(selectedUsages.stream().mapToDouble(u -> u.getTotalCost()).sum()) : null,
                unverified == 0, unverified, recent, upcoming, monthly,
                cropAreas.entrySet().stream().map(e -> new CropArea(e.getKey(), round(e.getValue()))).toList());
    }

    private static double kg(Harvest h) {
        return h.getUnit() == HarvestUnit.KG ? h.getQuantity() : h.getUnit() == HarvestUnit.TONS ? h.getQuantity() * 1000 : 0;
    }
    private static double bags(Harvest h) { return h.getUnit() == HarvestUnit.BAGS ? h.getQuantity() : 0; }
    private static double round(double value) { return Math.round(value * 100.0) / 100.0; }

    public ProductionReport productionReport(Long farmerId, LocalDate from, LocalDate to) {
        if (from.isAfter(to)) throw new BadRequestException("Start date must be on or before end date.");
        var recordedActivities = activities.findByCycle_FarmerId(farmerId).stream()
                .filter(a -> inPeriod(a.getActivityDate(), from, to))
                .sorted(Comparator.comparing(CycleActivity::getActivityDate).thenComparing(CycleActivity::getId))
                .map(a -> new Activity(a.getId(), a.getCycle().getId(), a.getCycle().getName(),
                        a.getActivityType().name(), a.getActivityDate(), a.getNotes())).toList();
        var recordedHarvests = harvests.findByCycle_FarmerId(farmerId).stream()
                .filter(h -> inPeriod(h.getHarvestDate(), from, to))
                .sorted(Comparator.comparing(Harvest::getHarvestDate).thenComparing(Harvest::getId)).toList();
        var touchedCycles = recordedActivities.stream().map(Activity::cycleId).collect(Collectors.toSet());
        recordedHarvests.forEach(h -> touchedCycles.add(h.getCycle().getId()));
        var reportCycles = cycles.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .filter(c -> touchedCycles.contains(c.getId()) || inPeriod(c.getStartDate(), from, to))
                .map(c -> new ProductionReport.CycleRow(c.getId(), c.getName(), c.getStatus(), c.getStartDate())).toList();
        var reportHarvests = recordedHarvests.stream()
                .map(h -> {
                    var cycle = h.getCycle();
                    var plot = cycle.getPlot();
                    return new ProductionReport.HarvestRow(h.getId(), cycle.getName(), cycle.getCropName(),
                            plot == null ? null : plot.getId(), plot == null ? null : plot.getName(),
                            h.getHarvestDate(), h.getQuantity(), h.getUnit(), h.getCalculatedYield());
                }).toList();
        return new ProductionReport(from, to, reportCycles, recordedActivities, reportHarvests);
    }

    private static boolean inPeriod(LocalDate date, LocalDate from, LocalDate to) {
        return date != null && !date.isBefore(from) && !date.isAfter(to);
    }
}
