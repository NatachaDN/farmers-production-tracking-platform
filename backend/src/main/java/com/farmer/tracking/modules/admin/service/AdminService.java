package com.farmer.tracking.modules.admin.service;

import com.farmer.tracking.common.audit.AuditEvent;
import com.farmer.tracking.common.audit.AuditEventRepository;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.modules.admin.api.AdminDtos.*;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.farm.entity.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Platform-wide, read-only views for administrators.
 * <p>
 * This is a reporting module: unlike the business modules it reads every module's repository
 * (read-only) to assemble cross-farmer figures. Aggregation is done in memory, which is fine at
 * the current data volume; move the heavy parts to SQL group-by queries if the tables grow large.
 */
@Service
@Transactional(readOnly = true)
public class AdminService {

    private static final int IDLE_AFTER_DAYS = 14;

    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final CycleRepository cycleRepository;
    private final CycleActivityRepository activityRepository;
    private final HarvestRepository harvestRepository;
    private final FarmInputRepository inputRepository;
    private final AuditEventRepository auditRepository;

    public AdminService(FarmerRepository farmerRepository, FarmRepository farmRepository, PlotRepository plotRepository,
                        CycleRepository cycleRepository, CycleActivityRepository activityRepository,
                        HarvestRepository harvestRepository, FarmInputRepository inputRepository,
                        AuditEventRepository auditRepository) {
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.cycleRepository = cycleRepository;
        this.activityRepository = activityRepository;
        this.harvestRepository = harvestRepository;
        this.inputRepository = inputRepository;
        this.auditRepository = auditRepository;
    }

    // ------------------------------------------------------------------ overview

    public Overview overview() {
        Data d = load();
        LocalDate today = LocalDate.now();

        List<CycleRow> cycleRows = d.cycles.stream().map(c -> toCycleRow(c, d)).toList();
        long overdue = cycleRows.stream().filter(c -> "overdue".equals(c.health())).count();
        long idle = cycleRows.stream().filter(c -> "idle".equals(c.health())).count();
        List<CycleRow> attention = Stream.concat(
                        cycleRows.stream().filter(c -> "overdue".equals(c.health())),
                        cycleRows.stream().filter(c -> "idle".equals(c.health())))
                .limit(6).toList();

        double harvestedKg = d.harvests.stream().mapToDouble(AdminService::kg).sum();
        double harvestedBags = d.harvests.stream().mapToDouble(AdminService::bags).sum();
        List<Cycle> active = d.cycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).toList();
        double avgProgress = active.stream().mapToInt(c -> c.getProgress() == null ? 0 : c.getProgress()).average().orElse(0);

        Totals totals = new Totals(
                d.farmers.size(),
                d.farmers.values().stream().filter(f -> AdminAccessPolicy.ROLE_ADMIN.equals(f.getRole())).count(),
                d.farmers.values().stream().filter(f -> "GOOGLE".equals(f.getAuthProvider())).count(),
                d.farms.size(),
                d.plots.size(),
                r1(d.plots.stream().mapToDouble(p -> p.getArea() == null ? 0 : p.getArea()).sum()),
                d.cycles.size(),
                active.size(),
                d.cycles.stream().filter(c -> c.getStatus() == CycleStatus.COMPLETED).count(),
                d.cycles.stream().filter(c -> c.getStatus() == CycleStatus.CANCELLED).count(),
                d.activities.size(),
                d.harvests.size(),
                d.inputs.size(),
                d.inputs.stream().mapToDouble(i -> nz(i.getCumulativeCost())).sum());

        Highlights highlights = new Highlights(
                d.farmers.values().stream().filter(f -> onOrAfter(f.getCreatedAt(), today.minusDays(6))).count(),
                d.farmers.values().stream().filter(f -> onOrAfter(f.getCreatedAt(), today.minusDays(29))).count(),
                d.farmers.values().stream().filter(f -> onOrAfter(f.getLastLoginAt(), today.minusDays(6))).count(),
                d.activities.stream().filter(a -> between(a.getActivityDate(), today.minusDays(6), today)).count(),
                d.activities.stream().filter(a -> between(a.getActivityDate(), today.minusDays(13), today.minusDays(7))).count(),
                r1(harvestedKg), r1(harvestedBags), r1(avgProgress), overdue, idle);

        List<Count> farmersByType = countEnum(FarmType.values(),
                d.farmers.values().stream().map(f -> f.getFarmType() == null ? FarmType.MIXED : f.getFarmType()).toList());
        List<Count> cyclesByStatus = countEnum(CycleStatus.values(),
                d.cycles.stream().map(Cycle::getStatus).toList());
        List<Count> activitiesByType = countEnum(ActivityType.values(),
                d.activities.stream().map(CycleActivity::getActivityType).toList());
        List<Count> stages = sortedCounts(active.stream()
                .collect(Collectors.groupingBy(c -> blankTo(c.getStage(), "Not set"), Collectors.counting())));

        Map<String, double[]> crops = new HashMap<>();
        for (Harvest h : d.harvests) {
            double[] acc = crops.computeIfAbsent(cropLabel(h.getCycle()), k -> new double[3]);
            acc[0] += kg(h);
            acc[1] += bags(h);
            acc[2] += 1;
        }
        List<CropOutput> harvestByCrop = crops.entrySet().stream()
                .map(e -> new CropOutput(e.getKey(), r1(e.getValue()[0]), r1(e.getValue()[1]), (long) e.getValue()[2]))
                .sorted(Comparator.comparingDouble(CropOutput::kg).reversed().thenComparing(CropOutput::crop))
                .toList();

        List<InputSpend> inputsByType = Arrays.stream(InputType.values()).map(t -> {
            List<FarmInput> items = d.inputs.stream().filter(i -> i.getType() == t).toList();
            return new InputSpend(t.name(), items.size(), items.stream().mapToDouble(i -> nz(i.getCumulativeCost())).sum());
        }).toList();

        List<MonthlyHarvest> harvestPerMonth = new ArrayList<>();
        YearMonth thisMonth = YearMonth.from(today);
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = thisMonth.minusMonths(i);
            List<Harvest> inMonth = d.harvests.stream()
                    .filter(h -> h.getHarvestDate() != null && YearMonth.from(h.getHarvestDate()).equals(ym)).toList();
            harvestPerMonth.add(new MonthlyHarvest(ym.toString(),
                    r1(inMonth.stream().mapToDouble(AdminService::kg).sum()),
                    r1(inMonth.stream().mapToDouble(AdminService::bags).sum())));
        }

        List<TopFarmer> top = d.farmers.values().stream()
                .map(f -> new TopFarmer(f.getId(), f.getFullName(),
                        d.cyclesByFarmer.getOrDefault(f.getId(), List.of()).size(),
                        d.activitiesByFarmer.getOrDefault(f.getId(), 0L),
                        r1(d.harvestKgByFarmer.getOrDefault(f.getId(), 0.0))))
                .filter(t -> t.cycles() > 0)
                .sorted(Comparator.comparingDouble(TopFarmer::harvestedKg).reversed()
                        .thenComparing(Comparator.comparingLong(TopFarmer::activities).reversed()))
                .limit(5).toList();

        List<ActivityRow> recent = d.activities.stream()
                .sorted(ACTIVITY_NEWEST_FIRST).limit(8).map(a -> toActivityRow(a, d)).toList();
        List<AuditRow> audit = auditRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8))
                .stream().map(AdminService::toAuditRow).toList();

        return new Overview(Instant.now(), totals, highlights, farmersByType, cyclesByStatus, activitiesByType,
                stages, harvestByCrop, inputsByType,
                perDay(30, today, d.activities.stream().map(CycleActivity::getActivityDate)),
                perDay(30, today, d.farmers.values().stream().map(f -> f.getCreatedAt() == null ? null : f.getCreatedAt().toLocalDate())),
                harvestPerMonth, top, attention, recent, audit);
    }

    // ------------------------------------------------------------------ farmers

    public List<FarmerRow> farmers(String query) {
        Data d = load();
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return d.farmers.values().stream()
                .filter(f -> q.isEmpty()
                        || contains(f.getFullName(), q) || contains(f.getEmailOrPhone(), q) || contains(f.getLocation(), q))
                .sorted(Comparator.comparing(Farmer::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(f -> toFarmerRow(f, d))
                .toList();
    }

    public FarmerDetail farmer(Long id) {
        Data d = load();
        Farmer farmer = d.farmers.get(id);
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer", id);
        }

        Map<Long, Long> plotsPerFarm = d.plots.stream().filter(p -> p.getFarm() != null)
                .collect(Collectors.groupingBy(p -> p.getFarm().getId(), Collectors.counting()));
        List<FarmRow> farms = d.farms.stream().filter(f -> id.equals(f.getFarmerId()))
                .map(f -> new FarmRow(f.getId(), f.getName(), f.getLocation(), f.getSize(),
                        Boolean.TRUE.equals(f.getIsDefault()), plotsPerFarm.getOrDefault(f.getId(), 0L)))
                .toList();
        List<PlotRow> plots = d.plots.stream().filter(p -> id.equals(p.getFarmerId()))
                .map(p -> new PlotRow(p.getId(), p.getName(), p.getArea(), p.getLocation(), p.getCropType(), p.getStage(),
                        p.getFarm() != null ? p.getFarm().getName() : null))
                .toList();
        List<CycleRow> cycles = d.cycles.stream().filter(c -> id.equals(c.getFarmerId()))
                .sorted(Comparator.comparing(Cycle::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> toCycleRow(c, d)).toList();
        List<ActivityRow> activities = d.activities.stream().filter(a -> id.equals(a.getCycle().getFarmerId()))
                .sorted(ACTIVITY_NEWEST_FIRST).limit(50).map(a -> toActivityRow(a, d)).toList();
        List<HarvestRow> harvests = d.harvests.stream().filter(h -> id.equals(h.getCycle().getFarmerId()))
                .sorted(Comparator.comparing(Harvest::getHarvestDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(h -> toHarvestRow(h, d)).toList();
        List<InputRow> inputs = d.inputs.stream().filter(i -> id.equals(i.getFarmerId()))
                .sorted(Comparator.comparing(FarmInput::getPurchaseDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(i -> toInputRow(i, d)).toList();
        List<AuditRow> audit = auditRepository.findByActorIdOrderByCreatedAtDesc(id, PageRequest.of(0, 30))
                .stream().map(AdminService::toAuditRow).toList();

        return new FarmerDetail(toFarmerRow(farmer, d), farms, plots, cycles, activities, harvests, inputs, audit);
    }

    // ------------------------------------------------------------------ activity & production lists

    public List<ActivityRow> activities(String type, int limit) {
        Data d = load();
        ActivityType filter = type == null || type.isBlank() ? null : ActivityType.valueOf(type.trim().toUpperCase(Locale.ROOT));
        return d.activities.stream()
                .filter(a -> filter == null || a.getActivityType() == filter)
                .sorted(ACTIVITY_NEWEST_FIRST)
                .limit(clamp(limit))
                .map(a -> toActivityRow(a, d))
                .toList();
    }

    public List<CycleRow> cycles(String status) {
        Data d = load();
        CycleStatus filter = status == null || status.isBlank() ? null : CycleStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        return d.cycles.stream()
                .filter(c -> filter == null || c.getStatus() == filter)
                .sorted(Comparator.comparing(Cycle::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> toCycleRow(c, d))
                .toList();
    }

    public List<HarvestRow> harvests() {
        Data d = load();
        return d.harvests.stream()
                .sorted(Comparator.comparing(Harvest::getHarvestDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(h -> toHarvestRow(h, d))
                .toList();
    }

    public List<InputRow> inputs() {
        Data d = load();
        return d.inputs.stream()
                .sorted(Comparator.comparing(FarmInput::getPurchaseDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(i -> toInputRow(i, d))
                .toList();
    }

    public List<AuditRow> audit(int limit) {
        return auditRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, clamp(limit)))
                .stream().map(AdminService::toAuditRow).toList();
    }

    // ------------------------------------------------------------------ mapping

    private FarmerRow toFarmerRow(Farmer f, Data d) {
        List<Cycle> cycles = d.cyclesByFarmer.getOrDefault(f.getId(), List.of());
        return new FarmerRow(f.getId(), f.getFullName(), f.getEmailOrPhone(), f.getLocation(),
                f.getFarmType() == null ? FarmType.MIXED.name() : f.getFarmType().name(),
                f.getRole(), f.getAuthProvider(), f.getAvatarUrl(), instant(f.getCreatedAt()), instant(f.getLastLoginAt()),
                d.farmsByFarmer.getOrDefault(f.getId(), 0L),
                d.plotsByFarmer.getOrDefault(f.getId(), 0L),
                cycles.size(),
                cycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count(),
                d.activitiesByFarmer.getOrDefault(f.getId(), 0L),
                r1(d.harvestKgByFarmer.getOrDefault(f.getId(), 0.0)),
                d.inputSpendByFarmer.getOrDefault(f.getId(), 0.0));
    }

    private CycleRow toCycleRow(Cycle c, Data d) {
        List<CycleActivity> acts = d.activitiesByCycle.getOrDefault(c.getId(), List.of());
        LocalDate last = acts.stream().map(CycleActivity::getActivityDate).filter(Objects::nonNull)
                .max(Comparator.naturalOrder()).orElse(null);
        Harvest h = d.harvestByCycle.get(c.getId());
        HarvestSummary harvest = h == null ? null
                : new HarvestSummary(h.getQuantity(), h.getUnit() == null ? null : h.getUnit().name(), h.getHarvestDate(), h.getCalculatedYield());
        return new CycleRow(c.getId(), c.getName(), c.getCropName(), c.getPlot() != null ? c.getPlot().getName() : null,
                c.getFarmerId(), farmerName(d, c.getFarmerId()),
                c.getStatus() == null ? null : c.getStatus().name(), c.getStage(), c.getProgress(), c.getAcreage(),
                c.getStartDate(), c.getEndDate(), c.getExpectedQuantity(), c.getExpectedQuantityUnit(),
                acts.size(), last, health(c, last), harvest);
    }

    private ActivityRow toActivityRow(CycleActivity a, Data d) {
        Cycle c = a.getCycle();
        return new ActivityRow(a.getId(), a.getActivityType() == null ? null : a.getActivityType().name(),
                a.getActivityDate(), a.getNotes(), instant(a.getCreatedAt()),
                c.getId(), c.getName(), cropLabel(c), c.getPlot() != null ? c.getPlot().getName() : null,
                c.getFarmerId(), farmerName(d, c.getFarmerId()));
    }

    private HarvestRow toHarvestRow(Harvest h, Data d) {
        Cycle c = h.getCycle();
        return new HarvestRow(h.getId(), c.getId(), c.getName(), cropLabel(c), c.getFarmerId(), farmerName(d, c.getFarmerId()),
                h.getQuantity(), h.getUnit() == null ? null : h.getUnit().name(), h.getHarvestDate(),
                h.getCalculatedYield(), h.getNotes());
    }

    private InputRow toInputRow(FarmInput i, Data d) {
        return new InputRow(i.getId(), i.getFarmerId(), farmerName(d, i.getFarmerId()), i.getName(),
                i.getType() == null ? null : i.getType().name(), i.getQuantity(), i.getUnit(), i.getPurchaseDate(),
                i.getPurchasePrice(), i.getCumulativeCost());
    }

    private static AuditRow toAuditRow(AuditEvent e) {
        return new AuditRow(e.getId(), e.getEventType().name(), e.getActorId(), e.getActorLabel(), e.getDetail(),
                e.getIpAddress(), instant(e.getCreatedAt()));
    }

    // ------------------------------------------------------------------ helpers

    private static final Comparator<CycleActivity> ACTIVITY_NEWEST_FIRST = Comparator
            .comparing(CycleActivity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing(CycleActivity::getActivityDate, Comparator.nullsLast(Comparator.reverseOrder()));

    /** Only active cycles get a health flag. */
    private static String health(Cycle c, LocalDate lastActivity) {
        if (c.getStatus() != CycleStatus.ACTIVE) {
            return null;
        }
        LocalDate today = LocalDate.now();
        if (c.getEndDate() != null && c.getEndDate().isBefore(today)) {
            return "overdue";
        }
        LocalDate lastTouch = lastActivity != null ? lastActivity : c.getStartDate();
        if (lastTouch != null && lastTouch.isBefore(today.minusDays(IDLE_AFTER_DAYS))) {
            return "idle";
        }
        return "on-track";
    }

    private static String cropLabel(Cycle c) {
        return blankTo(c.getCropName(), blankTo(c.getName(), "Unnamed crop"));
    }

    private static String farmerName(Data d, Long farmerId) {
        Farmer f = d.farmers.get(farmerId);
        return f != null ? f.getFullName() : "Farmer #" + farmerId;
    }

    /** Tons are converted to kilograms; bags have no known weight so they are reported separately. */
    private static double kg(Harvest h) {
        if (h.getQuantity() == null || h.getUnit() == null) return 0;
        return switch (h.getUnit()) {
            case KG -> h.getQuantity();
            case TONS -> h.getQuantity() * 1000;
            case BAGS -> 0;
        };
    }

    private static double bags(Harvest h) {
        return h.getUnit() != null && h.getUnit().name().equals("BAGS") && h.getQuantity() != null ? h.getQuantity() : 0;
    }

    /** Timestamps are stored in server-local time; send them as instants so browsers show the right moment. */
    private static Instant instant(LocalDateTime t) {
        return t == null ? null : t.atZone(ZoneId.systemDefault()).toInstant();
    }

    private static double nz(Double v) {
        return v == null ? 0 : v;
    }

    private static double r1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static int clamp(int limit) {
        return Math.max(1, Math.min(limit, 500));
    }

    private static boolean contains(String value, String q) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(q);
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static boolean onOrAfter(LocalDateTime t, LocalDate from) {
        return t != null && !t.toLocalDate().isBefore(from);
    }

    private static boolean between(LocalDate d, LocalDate from, LocalDate to) {
        return d != null && !d.isBefore(from) && !d.isAfter(to);
    }

    private static <E extends Enum<E>> List<Count> countEnum(E[] values, List<E> items) {
        Map<E, Long> counts = items.stream().filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        return Arrays.stream(values).map(v -> new Count(v.name(), counts.getOrDefault(v, 0L))).toList();
    }

    private static List<Count> sortedCounts(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .map(e -> new Count(e.getKey(), e.getValue()))
                .toList();
    }

    private static List<DayCount> perDay(int days, LocalDate today, Stream<LocalDate> dates) {
        Map<LocalDate, Long> counts = dates.filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        List<DayCount> series = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            series.add(new DayCount(day, counts.getOrDefault(day, 0L)));
        }
        return series;
    }

    /** Everything the console needs, loaded once per request. */
    private Data load() {
        return new Data(
                farmerRepository.findAll(), farmRepository.findAll(), plotRepository.findAll(),
                cycleRepository.findAll(), activityRepository.findAll(), harvestRepository.findAll(),
                inputRepository.findAll());
    }

    private static final class Data {
        final Map<Long, Farmer> farmers;
        final List<Farm> farms;
        final List<Plot> plots;
        final List<Cycle> cycles;
        final List<CycleActivity> activities;
        final List<Harvest> harvests;
        final List<FarmInput> inputs;

        final Map<Long, Long> farmsByFarmer;
        final Map<Long, Long> plotsByFarmer;
        final Map<Long, List<Cycle>> cyclesByFarmer;
        final Map<Long, List<CycleActivity>> activitiesByCycle;
        final Map<Long, Long> activitiesByFarmer;
        final Map<Long, Harvest> harvestByCycle;
        final Map<Long, Double> harvestKgByFarmer;
        final Map<Long, Double> inputSpendByFarmer;

        Data(List<Farmer> farmers, List<Farm> farms, List<Plot> plots, List<Cycle> cycles,
             List<CycleActivity> activities, List<Harvest> harvests, List<FarmInput> inputs) {
            this.farmers = farmers.stream().collect(Collectors.toMap(Farmer::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
            this.farms = farms;
            this.plots = plots;
            this.cycles = cycles;
            this.activities = activities;
            this.harvests = harvests;
            this.inputs = inputs;

            this.farmsByFarmer = farms.stream().collect(Collectors.groupingBy(Farm::getFarmerId, Collectors.counting()));
            this.plotsByFarmer = plots.stream().collect(Collectors.groupingBy(Plot::getFarmerId, Collectors.counting()));
            this.cyclesByFarmer = cycles.stream().collect(Collectors.groupingBy(Cycle::getFarmerId));
            this.activitiesByCycle = activities.stream().collect(Collectors.groupingBy(a -> a.getCycle().getId()));
            this.activitiesByFarmer = activities.stream()
                    .collect(Collectors.groupingBy(a -> a.getCycle().getFarmerId(), Collectors.counting()));
            this.harvestByCycle = harvests.stream()
                    .collect(Collectors.toMap(h -> h.getCycle().getId(), Function.identity(), (a, b) -> a));
            this.harvestKgByFarmer = harvests.stream()
                    .collect(Collectors.groupingBy(h -> h.getCycle().getFarmerId(), Collectors.summingDouble(AdminService::kg)));
            this.inputSpendByFarmer = inputs.stream()
                    .collect(Collectors.groupingBy(FarmInput::getFarmerId, Collectors.summingDouble(i -> nz(i.getCumulativeCost()))));
        }
    }
}
