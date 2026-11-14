package com.farmer.tracking.modules.manager.service;

import com.farmer.tracking.common.audit.AuditEvent;
import com.farmer.tracking.common.audit.AuditEventRepository;
import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.manager.dto.ManagerDtos.*;
import com.farmer.tracking.modules.manager.service.ManagerScopeHelper.ManagerScope;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class ManagerServiceImpl implements ManagerService {

    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final CycleRepository cycleRepository;
    private final HarvestRepository harvestRepository;
    private final CycleIncidentRepository incidentRepository;
    private final FarmInputRepository inputRepository;
    private final AnimalGroupRepository animalGroupRepository;
    private final AuditEventRepository auditEventRepository;
    private final ManagerScopeHelper scopeHelper;

    public ManagerServiceImpl(
            FarmerRepository farmerRepository,
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            CycleRepository cycleRepository,
            HarvestRepository harvestRepository,
            CycleIncidentRepository incidentRepository,
            FarmInputRepository inputRepository,
            AnimalGroupRepository animalGroupRepository,
            AuditEventRepository auditEventRepository,
            ManagerScopeHelper scopeHelper
    ) {
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.cycleRepository = cycleRepository;
        this.harvestRepository = harvestRepository;
        this.incidentRepository = incidentRepository;
        this.inputRepository = inputRepository;
        this.animalGroupRepository = animalGroupRepository;
        this.auditEventRepository = auditEventRepository;
        this.scopeHelper = scopeHelper;
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

    private static boolean isSupervisedFarmer(Farmer f) {
        return f != null && (f.getRole() == null || "ROLE_FARMER".equalsIgnoreCase(f.getRole()));
    }

    private static Long getFarmerId(Harvest h) {
        return (h != null && h.getCycle() != null) ? h.getCycle().getFarmerId() : null;
    }

    private static String getCropName(Harvest h) {
        return (h != null && h.getCycle() != null && h.getCycle().getCropName() != null)
                ? h.getCycle().getCropName() : "General Crop";
    }

    @Override
    public ManagerDashboardSummary getDashboardSummary(UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        List<Farmer> farmers = farmerRepository.findAll().stream()
                .filter(ManagerServiceImpl::isSupervisedFarmer)
                .filter(f -> scope.allowsFarmer(f.getId()))
                .toList();
        Map<Long, Farmer> farmerMap = farmers.stream().collect(Collectors.toMap(Farmer::getId, Function.identity(), (a, b) -> a));

        long totalFarmers = farmers.size();
        long pendingFarmers = farmers.stream().filter(f -> f.getStatus() == RegistrationStatus.PENDING).count();
        long approvedFarmers = farmers.stream().filter(f -> f.getStatus() == RegistrationStatus.APPROVED).count();
        long rejectedFarmers = farmers.stream().filter(f -> f.getStatus() == RegistrationStatus.REJECTED).count();

        List<Cycle> allCycles = cycleRepository.findAll().stream()
                .filter(c -> scope.allowsFarmer(c.getFarmerId()))
                .toList();
        int activeCyclesCount = (int) allCycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count();
        int completedCyclesCount = (int) allCycles.stream().filter(c -> c.getStatus() == CycleStatus.COMPLETED).count();

        List<Harvest> allHarvests = harvestRepository.findAll().stream()
                .filter(h -> scope.allowsFarmer(getFarmerId(h)))
                .toList();
        double totalHarvestKg = allHarvests.stream().mapToDouble(ManagerServiceImpl::toKg).sum();
        totalHarvestKg = Math.round(totalHarvestKg * 10.0) / 10.0;
        double totalHarvestTons = Math.round((totalHarvestKg / 1000.0) * 10.0) / 10.0;

        List<Plot> allPlots = plotRepository.findAll().stream()
                .filter(p -> scope.allowsFarmer(p.getFarmerId()))
                .toList();
        int totalPlotsCount = allPlots.size();
        double totalAreaHa = allPlots.stream().mapToDouble(p -> p.getArea() != null ? p.getArea() : 0.0).sum();
        totalAreaHa = Math.round(totalAreaHa * 100.0) / 100.0;

        List<AnimalGroup> allAnimals = animalGroupRepository.findAll().stream()
                .filter(ag -> scope.allowsFarmer(ag.getFarmerId()))
                .toList();
        int totalAnimalGroupsCount = allAnimals.size();
        long totalAnimalPopulation = allAnimals.stream().mapToLong(ag -> ag.getCurrentPopulation() != null ? ag.getCurrentPopulation() : 0).sum();

        List<CycleIncident> allIncidents = incidentRepository.findAll().stream()
                .filter(inc -> scope.allowsFarmer(inc.getFarmerId()))
                .toList();
        int activeAlertsCount = (int) allIncidents.stream().filter(i -> i.getSeverityLevel() != null && i.getSeverityLevel() >= 3).count();

        // Recent alerts
        Map<Long, Cycle> cycleMap = allCycles.stream().collect(Collectors.toMap(Cycle::getId, Function.identity(), (a, b) -> a));
        List<ManagerAlertRow> recentAlerts = allIncidents.stream()
                .sorted(Comparator.comparing(CycleIncident::getIncidentDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(inc -> {
                    Cycle c = inc.getCycle() != null ? inc.getCycle() : (inc.getCycle() != null && cycleMap.containsKey(inc.getCycle().getId()) ? cycleMap.get(inc.getCycle().getId()) : null);
                    Farmer f = (c != null && c.getFarmerId() != null) ? farmerMap.get(c.getFarmerId()) : null;
                    String farmerName = f != null ? f.getFullName() : "Unknown Farmer";
                    String farmName = f != null && f.getFarmName() != null ? f.getFarmName() : "Main Farm";
                    String plotName = (c != null && c.getPlot() != null && c.getPlot().getName() != null) ? c.getPlot().getName() : "Field Plot";
                    String cycleName = c != null ? c.getName() : "Crop Cycle";
                    return new ManagerAlertRow(
                            inc.getId(),
                            f != null ? f.getId() : null,
                            farmerName,
                            farmName,
                            plotName,
                            cycleName,
                            inc.getIncidentType() != null ? inc.getIncidentType().name() : "INCIDENT",
                            inc.getSeverityLevel(),
                            inc.getIncidentDate(),
                            inc.getDescription(),
                            inc.getActionTaken()
                    );
                })
                .toList();

        // Top producing farmers
        Map<Long, Double> yieldByFarmer = allHarvests.stream()
                .filter(h -> getFarmerId(h) != null)
                .collect(Collectors.groupingBy(ManagerServiceImpl::getFarmerId, Collectors.summingDouble(ManagerServiceImpl::toKg)));

        Map<Long, Long> activeCyclesByFarmer = allCycles.stream()
                .filter(c -> c.getStatus() == CycleStatus.ACTIVE && c.getFarmerId() != null)
                .collect(Collectors.groupingBy(Cycle::getFarmerId, Collectors.counting()));

        Map<Long, Long> plotsByFarmer = allPlots.stream()
                .filter(p -> p.getFarmerId() != null)
                .collect(Collectors.groupingBy(Plot::getFarmerId, Collectors.counting()));

        List<TopProducerRow> topProducers = yieldByFarmer.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Farmer f = farmerMap.get(entry.getKey());
                    String name = f != null ? f.getFullName() : "Farmer #" + entry.getKey();
                    String loc = f != null ? f.getLocation() : "—";
                    String farmName = f != null ? f.getFarmName() : "Main Farm";
                    double yKg = Math.round(entry.getValue() * 10.0) / 10.0;
                    double yTons = Math.round((yKg / 1000.0) * 10.0) / 10.0;
                    int act = activeCyclesByFarmer.getOrDefault(entry.getKey(), 0L).intValue();
                    int pl = plotsByFarmer.getOrDefault(entry.getKey(), 0L).intValue();
                    return new TopProducerRow(entry.getKey(), name, loc, farmName, yKg, yTons, act, pl);
                })
                .toList();

        // Monthly production across last 12 months
        List<MonthlyProductionItem> monthlyProduction = new ArrayList<>();
        YearMonth currentYm = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            double sumMonthKg = allHarvests.stream()
                    .filter(h -> h.getHarvestDate() != null && YearMonth.from(h.getHarvestDate()).equals(ym))
                    .mapToDouble(ManagerServiceImpl::toKg)
                    .sum();
            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthlyProduction.add(new MonthlyProductionItem(monthName, Math.round(sumMonthKg * 10.0) / 10.0));
        }

        // Pending registrations
        List<ManagerFarmerRow> pendingRegistrations = farmers.stream()
                .filter(f -> f.getStatus() == RegistrationStatus.PENDING)
                .sorted(Comparator.comparing(Farmer::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(f -> toFarmerRow(f, allPlots, allCycles, allHarvests))
                .toList();

        return new ManagerDashboardSummary(
                totalFarmers,
                pendingFarmers,
                approvedFarmers,
                rejectedFarmers,
                activeCyclesCount,
                completedCyclesCount,
                totalHarvestKg,
                totalHarvestTons,
                totalAreaHa,
                totalPlotsCount,
                totalAnimalGroupsCount,
                totalAnimalPopulation,
                activeAlertsCount,
                recentAlerts,
                topProducers,
                monthlyProduction,
                pendingRegistrations
        );
    }

    @Override
    public List<ManagerFarmerRow> getFarmers(String search, String region, String crop, RegistrationStatus status, String sort, UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        List<Farmer> farmers = farmerRepository.findAll().stream()
                .filter(ManagerServiceImpl::isSupervisedFarmer)
                .filter(f -> scope.allowsFarmer(f.getId()))
                .toList();
        List<Plot> allPlots = plotRepository.findAll();
        List<Cycle> allCycles = cycleRepository.findAll();
        List<Harvest> allHarvests = harvestRepository.findAll();

        Stream<ManagerFarmerRow> stream = farmers.stream()
                .map(f -> toFarmerRow(f, allPlots, allCycles, allHarvests));

        // Filter: search keyword
        if (search != null && !search.trim().isBlank()) {
            String q = search.trim().toLowerCase();
            stream = stream.filter(r ->
                    (r.fullName() != null && r.fullName().toLowerCase().contains(q)) ||
                    (r.emailOrPhone() != null && r.emailOrPhone().toLowerCase().contains(q)) ||
                    (r.location() != null && r.location().toLowerCase().contains(q)) ||
                    (r.farmName() != null && r.farmName().toLowerCase().contains(q))
            );
        }

        // Filter: region
        if (region != null && !region.trim().isBlank() && !"ALL".equalsIgnoreCase(region.trim())) {
            String reg = region.trim().toLowerCase();
            stream = stream.filter(r ->
                    (r.region() != null && r.region().toLowerCase().contains(reg)) ||
                    (r.location() != null && r.location().toLowerCase().contains(reg))
            );
        }

        // Filter: crop
        if (crop != null && !crop.trim().isBlank() && !"ALL".equalsIgnoreCase(crop.trim())) {
            String crp = crop.trim().toLowerCase();
            stream = stream.filter(r -> r.cropsGrown() != null && r.cropsGrown().stream().anyMatch(c -> c.toLowerCase().contains(crp)));
        }

        // Filter: status
        if (status != null) {
            stream = stream.filter(r -> r.status() == status);
        }

        // Sorting
        Comparator<ManagerFarmerRow> comparator = switch (sort != null ? sort.toLowerCase() : "name") {
            case "plots" -> Comparator.comparingInt(ManagerFarmerRow::plotsCount).reversed();
            case "cycles" -> Comparator.comparingInt(ManagerFarmerRow::activeCycles).reversed();
            case "harvest" -> Comparator.comparingDouble(ManagerFarmerRow::harvestedKg).reversed();
            case "joined" -> Comparator.comparing(ManagerFarmerRow::joinedAt, Comparator.nullsLast(Comparator.reverseOrder()));
            case "status" -> Comparator.comparing(r -> r.status() == RegistrationStatus.PENDING ? 0 : r.status() == RegistrationStatus.APPROVED ? 1 : 2);
            default -> Comparator.comparing(ManagerFarmerRow::fullName, String.CASE_INSENSITIVE_ORDER);
        };

        return stream.sorted(comparator).toList();
    }

    private ManagerFarmerRow toFarmerRow(Farmer f, List<Plot> allPlots, List<Cycle> allCycles, List<Harvest> allHarvests) {
        List<Plot> farmerPlots = allPlots.stream().filter(p -> f.getId().equals(p.getFarmerId())).toList();
        List<Cycle> farmerCycles = allCycles.stream().filter(c -> f.getId().equals(c.getFarmerId())).toList();
        List<Harvest> farmerHarvests = allHarvests.stream().filter(h -> f.getId().equals(getFarmerId(h))).toList();

        int plotsCount = farmerPlots.size();
        int activeCycles = (int) farmerCycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count();
        int totalCycles = farmerCycles.size();

        double harvestedKg = farmerHarvests.stream().mapToDouble(ManagerServiceImpl::toKg).sum();
        harvestedKg = Math.round(harvestedKg * 10.0) / 10.0;
        double harvestedTons = Math.round((harvestedKg / 1000.0) * 10.0) / 10.0;

        // Distinct crops collected from plots, cycles, and farmer field
        Set<String> crops = new LinkedHashSet<>();
        if (f.getCropsGrown() != null && !f.getCropsGrown().isBlank()) {
            for (String s : f.getCropsGrown().split(",")) {
                if (!s.trim().isBlank()) crops.add(s.trim());
            }
        }
        for (Plot p : farmerPlots) {
            if (p.getCropType() != null && !p.getCropType().isBlank()) crops.add(p.getCropType().trim());
        }
        for (Cycle c : farmerCycles) {
            if (c.getCropName() != null && !c.getCropName().isBlank()) crops.add(c.getCropName().trim());
        }

        String region = f.getLocation();
        if (region != null && region.contains(",")) {
            String[] parts = region.split(",");
            region = parts[parts.length - 1].trim();
        }

        return new ManagerFarmerRow(
                f.getId(),
                f.getFullName(),
                f.getEmailOrPhone(),
                f.getLocation(),
                region,
                f.getFarmName() != null ? f.getFarmName() : "Main Farm",
                f.getFarmType(),
                new ArrayList<>(crops),
                plotsCount,
                activeCycles,
                totalCycles,
                harvestedKg,
                harvestedTons,
                f.getStatus() != null ? f.getStatus() : RegistrationStatus.APPROVED,
                f.getRejectionReason(),
                f.getCreatedAt(),
                f.getLastLoginAt()
        );
    }

    @Override
    public ManagerFarmerDetail getFarmerDetail(Long farmerId, UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        scopeHelper.requireFarmerAccess(scope, farmerId);
        Farmer f = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + farmerId));

        List<Farm> farms = farmRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        List<Plot> plots = plotRepository.findByFarmerId(farmerId);
        List<Cycle> cycles = cycleRepository.findByFarmerId(farmerId);
        List<Harvest> harvests = harvestRepository.findByFarmerIdOrderByHarvestDateDesc(farmerId);
        List<AnimalGroup> animals = animalGroupRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);

        Map<Long, Plot> plotMap = plots.stream().collect(Collectors.toMap(Plot::getId, Function.identity(), (a, b) -> a));

        List<CycleIncident> incidents = new ArrayList<>();
        for (Cycle c : cycles) {
            incidents.addAll(incidentRepository.findByCycleIdOrderByIncidentDateDesc(c.getId()));
        }

        ManagerFarmerRow farmerRow = toFarmerRow(f, plots, cycles, harvests);

        List<FarmerFarmItem> farmItems = farms.stream().map(fm -> new FarmerFarmItem(
                fm.getId(), fm.getName(), fm.getType() != null ? fm.getType().name() : "MIXED",
                fm.getSize(), fm.getSizeUnit() != null ? fm.getSizeUnit().name() : "HECTARES",
                fm.getRegion(), fm.getDistrict(), fm.getStatus() != null ? fm.getStatus().name() : "ACTIVE"
        )).toList();

        List<FarmerPlotItem> plotItems = plots.stream().map(p -> new FarmerPlotItem(
                p.getId(), p.getName(), p.getArea(), p.getLocation(), p.getCropType(), p.getStage()
        )).toList();

        List<FarmerCycleItem> cycleItems = cycles.stream().map(c -> new FarmerCycleItem(
                c.getId(), c.getName(), c.getCropName(),
                c.getPlot() != null ? c.getPlot().getName() : (c.getPlot() != null && plotMap.containsKey(c.getPlot().getId()) ? plotMap.get(c.getPlot().getId()).getName() : "Plot"),
                c.getStatus() != null ? c.getStatus().name() : "ACTIVE",
                c.getStartDate(), c.getEndDate(), c.getAcreage()
        )).toList();

        List<FarmerHarvestItem> harvestItems = harvests.stream().map(h -> new FarmerHarvestItem(
                h.getId(), h.getCycle() != null ? h.getCycle().getId() : null,
                getCropName(h), toKg(h), h.getHarvestDate(),
                null
        )).toList();

        List<ManagerAlertRow> alertItems = incidents.stream().map(inc -> new ManagerAlertRow(
                inc.getId(), farmerId, f.getFullName(), f.getFarmName(),
                inc.getCycle() != null && inc.getCycle().getPlot() != null ? inc.getCycle().getPlot().getName() : "Plot",
                inc.getCycle() != null ? inc.getCycle().getName() : "Cycle",
                inc.getIncidentType() != null ? inc.getIncidentType().name() : "INCIDENT",
                inc.getSeverityLevel(), inc.getIncidentDate(), inc.getDescription(), inc.getActionTaken()
        )).toList();

        List<FarmerAnimalGroupItem> animalItems = animals.stream().map(ag -> new FarmerAnimalGroupItem(
                ag.getId(), ag.getName(), ag.getAnimalType() != null ? ag.getAnimalType().getDisplayName() : "Livestock",
                ag.getBreed(), ag.getCurrentPopulation(), ag.getLocation(),
                ag.getStatus() != null ? ag.getStatus().name() : "ACTIVE"
        )).toList();

        return new ManagerFarmerDetail(farmerRow, farmItems, plotItems, cycleItems, harvestItems, alertItems, animalItems);
    }

    @Override
    @Transactional
    public ManagerFarmerRow updateFarmerStatus(Long farmerId, UpdateFarmerStatusRequest request, String managerEmail, UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        scopeHelper.requireFarmerAccess(scope, farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + farmerId));

        RegistrationStatus newStatus = request.getStatus();
        farmer.setStatus(newStatus);
        if (newStatus == RegistrationStatus.REJECTED) {
            farmer.setRejectionReason(request.getRejectionReason() != null ? request.getRejectionReason().trim() : "Application rejected by manager.");
        } else if (newStatus == RegistrationStatus.APPROVED) {
            farmer.setRejectionReason(null);
        }

        Farmer saved = farmerRepository.save(farmer);

        // Record audit event
        auditEventRepository.save(new AuditEvent(
                AuditEventType.FARMER_STATUS_UPDATED,
                saved.getId(),
                saved.getEmailOrPhone(),
                "Manager " + managerEmail + " set status to " + newStatus + (newStatus == RegistrationStatus.REJECTED ? " (Reason: " + saved.getRejectionReason() + ")" : ""),
                "MANAGER_ACTION"
        ));

        List<Plot> allPlots = plotRepository.findAll();
        List<Cycle> allCycles = cycleRepository.findAll();
        List<Harvest> allHarvests = harvestRepository.findAll();

        return toFarmerRow(saved, allPlots, allCycles, allHarvests);
    }

    @Override
    public ConsolidatedReportResponse generateConsolidatedReport(ConsolidatedReportRequest request, UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusMonths(6);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();

        List<Farmer> farmers;
        if (request.getFarmerIds() != null && !request.getFarmerIds().isEmpty()) {
            farmers = farmerRepository.findAllById(request.getFarmerIds()).stream()
                    .filter(ManagerServiceImpl::isSupervisedFarmer)
                    .filter(f -> scope.allowsFarmer(f.getId()))
                    .toList();
        } else {
            farmers = farmerRepository.findAll().stream()
                    .filter(ManagerServiceImpl::isSupervisedFarmer)
                    .filter(f -> scope.allowsFarmer(f.getId()))
                    .toList();
        }

        // Apply region filter if specified
        if (request.getRegion() != null && !request.getRegion().isBlank() && !"ALL".equalsIgnoreCase(request.getRegion().trim())) {
            String reg = request.getRegion().trim().toLowerCase();
            farmers = farmers.stream()
                    .filter(f -> f.getLocation() != null && f.getLocation().toLowerCase().contains(reg))
                    .toList();
        }

        List<Plot> allPlots = plotRepository.findAll().stream()
                .filter(p -> scope.allowsFarmer(p.getFarmerId()))
                .toList();
        List<Cycle> allCycles = cycleRepository.findAll().stream()
                .filter(c -> scope.allowsFarmer(c.getFarmerId()))
                .toList();
        List<Harvest> allHarvests = harvestRepository.findAll().stream()
                .filter(h -> scope.allowsFarmer(getFarmerId(h)))
                .toList();
        List<CycleIncident> allIncidents = incidentRepository.findAll().stream()
                .filter(i -> scope.allowsFarmer(i.getFarmerId()))
                .toList();
        List<FarmInput> allInputs = inputRepository.findAll().stream()
                .filter(inp -> scope.allowsFarmer(inp.getFarmerId()))
                .toList();

        // Filter harvests by date range
        List<Harvest> periodHarvests = allHarvests.stream()
                .filter(h -> h.getHarvestDate() != null && !h.getHarvestDate().isBefore(startDate) && !h.getHarvestDate().isAfter(endDate))
                .toList();

        // Filter incidents by date range
        List<CycleIncident> periodIncidents = allIncidents.stream()
                .filter(i -> i.getIncidentDate() != null && !i.getIncidentDate().isBefore(startDate) && !i.getIncidentDate().isAfter(endDate))
                .toList();

        // Calculate totals across filtered farmers
        Set<Long> farmerIdSet = farmers.stream().map(Farmer::getId).collect(Collectors.toSet());

        final List<Harvest> finalHarvests;
        if (request.getCrop() != null && !request.getCrop().isBlank() && !"ALL".equalsIgnoreCase(request.getCrop().trim())) {
            String crp = request.getCrop().trim().toLowerCase();
            finalHarvests = periodHarvests.stream()
                    .filter(h -> getFarmerId(h) != null && farmerIdSet.contains(getFarmerId(h)))
                    .filter(h -> getCropName(h).toLowerCase().contains(crp))
                    .toList();
        } else {
            finalHarvests = periodHarvests.stream()
                    .filter(h -> getFarmerId(h) != null && farmerIdSet.contains(getFarmerId(h)))
                    .toList();
        }

        double totalYieldKg = finalHarvests.stream().mapToDouble(ManagerServiceImpl::toKg).sum();
        totalYieldKg = Math.round(totalYieldKg * 10.0) / 10.0;
        double totalYieldTons = Math.round((totalYieldKg / 1000.0) * 10.0) / 10.0;

        List<Cycle> relevantCycles = allCycles.stream()
                .filter(c -> c.getFarmerId() != null && farmerIdSet.contains(c.getFarmerId()))
                .toList();

        int totalActiveCycles = (int) relevantCycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count();
        int totalCompletedCycles = (int) relevantCycles.stream().filter(c -> c.getStatus() == CycleStatus.COMPLETED).count();

        List<Plot> relevantPlots = allPlots.stream()
                .filter(p -> p.getFarmerId() != null && farmerIdSet.contains(p.getFarmerId()))
                .toList();

        int totalPlotsCount = relevantPlots.size();
        double totalAreaHa = relevantPlots.stream().mapToDouble(p -> p.getArea() != null ? p.getArea() : 0.0).sum();
        totalAreaHa = Math.round(totalAreaHa * 100.0) / 100.0;

        int totalIncidentsCount = (int) periodIncidents.stream()
                .filter(i -> i.getFarmerId() != null && farmerIdSet.contains(i.getFarmerId()))
                .count();

        double totalInputsCost = allInputs.stream()
                .filter(inp -> inp.getFarmerId() != null && farmerIdSet.contains(inp.getFarmerId()))
                .mapToDouble(inp -> inp.getCumulativeCost() != null ? inp.getCumulativeCost() : (inp.getPurchasePrice() != null ? inp.getPurchasePrice() : 0.0))
                .sum();
        totalInputsCost = Math.round(totalInputsCost * 100.0) / 100.0;

        // Crop Breakdown
        Map<String, Double> cropYields = finalHarvests.stream()
                .collect(Collectors.groupingBy(ManagerServiceImpl::getCropName, Collectors.summingDouble(ManagerServiceImpl::toKg)));

        Map<String, Long> cropCycles = relevantCycles.stream()
                .collect(Collectors.groupingBy(c -> c.getCropName() != null ? c.getCropName() : "General Crop", Collectors.counting()));

        final double finalTotalKg = totalYieldKg;
        List<CropConsolidatedRow> cropBreakdown = cropYields.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    double kg = Math.round(e.getValue() * 10.0) / 10.0;
                    double tons = Math.round((kg / 1000.0) * 10.0) / 10.0;
                    int cyc = cropCycles.getOrDefault(e.getKey(), 0L).intValue();
                    double share = finalTotalKg > 0 ? Math.round((kg / finalTotalKg) * 1000.0) / 10.0 : 0.0;
                    return new CropConsolidatedRow(e.getKey(), kg, tons, cyc, share);
                })
                .toList();

        // Farmer Breakdown
        Map<Long, Double> farmerYields = finalHarvests.stream()
                .collect(Collectors.groupingBy(ManagerServiceImpl::getFarmerId, Collectors.summingDouble(ManagerServiceImpl::toKg)));

        List<FarmerConsolidatedRow> farmerBreakdown = farmers.stream()
                .map(f -> {
                    double yKg = Math.round(farmerYields.getOrDefault(f.getId(), 0.0) * 10.0) / 10.0;
                    double yTons = Math.round((yKg / 1000.0) * 10.0) / 10.0;
                    int pl = (int) relevantPlots.stream().filter(p -> f.getId().equals(p.getFarmerId())).count();
                    int act = (int) relevantCycles.stream().filter(c -> f.getId().equals(c.getFarmerId()) && c.getStatus() == CycleStatus.ACTIVE).count();
                    int comp = (int) relevantCycles.stream().filter(c -> f.getId().equals(c.getFarmerId()) && c.getStatus() == CycleStatus.COMPLETED).count();

                    List<String> crops = finalHarvests.stream()
                            .filter(h -> f.getId().equals(getFarmerId(h)))
                            .map(ManagerServiceImpl::getCropName)
                            .distinct()
                            .toList();

                    String reg = f.getLocation();
                    if (reg != null && reg.contains(",")) {
                        String[] parts = reg.split(",");
                        reg = parts[parts.length - 1].trim();
                    }

                    return new FarmerConsolidatedRow(
                            f.getId(), f.getFullName(), f.getLocation(), reg, f.getFarmName() != null ? f.getFarmName() : "Main Farm",
                            pl, act, comp, yKg, yTons, crops
                    );
                })
                .sorted(Comparator.comparingDouble(FarmerConsolidatedRow::harvestedKg).reversed())
                .toList();

        String reportId = "REP-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return new ConsolidatedReportResponse(
                reportId,
                LocalDateTime.now(),
                startDate,
                endDate,
                farmers.size(),
                totalYieldKg,
                totalYieldTons,
                totalActiveCycles,
                totalCompletedCycles,
                totalPlotsCount,
                totalAreaHa,
                totalIncidentsCount,
                totalInputsCost,
                cropBreakdown,
                farmerBreakdown
        );
    }

    @Override
    public String exportConsolidatedReportCsv(ConsolidatedReportRequest request, UserPrincipal principal) {
        ConsolidatedReportResponse rep = generateConsolidatedReport(request, principal);
        StringBuilder sb = new StringBuilder();

        sb.append("# ACREA PLATFORM — CONSOLIDATED PRODUCTION REPORT\n");
        sb.append("# Report ID: ").append(rep.reportId()).append("\n");
        sb.append("# Period: ").append(rep.startDate()).append(" to ").append(rep.endDate()).append("\n");
        sb.append("# Generated At: ").append(rep.generatedAt()).append("\n");
        sb.append("# Total Farmers: ").append(rep.totalFarmersCount()).append("\n");
        sb.append("# Total Production: ").append(rep.totalYieldTons()).append(" Tons (").append(rep.totalYieldKg()).append(" Kg)\n");
        sb.append("# Active Cycles: ").append(rep.totalActiveCycles()).append("\n");
        sb.append("# Total Cultivated Area: ").append(rep.totalCultivatedAreaHa()).append(" Ha\n\n");

        sb.append("--- CROP PRODUCTION SUMMARY ---\n");
        sb.append("Crop Name,Yield (Kg),Yield (Tons),Cycles Count,Share (%)\n");
        for (CropConsolidatedRow c : rep.cropBreakdown()) {
            sb.append("\"").append(c.cropName()).append("\",")
              .append(c.yieldKg()).append(",")
              .append(c.yieldTons()).append(",")
              .append(c.cyclesCount()).append(",")
              .append(c.sharePercent()).append("%\n");
        }
        sb.append("\n");

        sb.append("--- FARMER PERFORMANCE BREAKDOWN ---\n");
        sb.append("Farmer ID,Full Name,Location,Region,Farm Name,Plots,Active Cycles,Completed Cycles,Harvest (Kg),Harvest (Tons),Crops\n");
        for (FarmerConsolidatedRow f : rep.farmerBreakdown()) {
            sb.append(f.farmerId()).append(",")
              .append("\"").append(f.farmerName()).append("\",")
              .append("\"").append(f.location() != null ? f.location() : "").append("\",")
              .append("\"").append(f.region() != null ? f.region() : "").append("\",")
              .append("\"").append(f.farmName() != null ? f.farmName() : "").append("\",")
              .append(f.plotsCount()).append(",")
              .append(f.activeCycles()).append(",")
              .append(f.completedCycles()).append(",")
              .append(f.harvestedKg()).append(",")
              .append(f.harvestedTons()).append(",")
              .append("\"").append(String.join("; ", f.crops())).append("\"\n");
        }

        return sb.toString();
    }

    @Override
    public ManagerProductionsResponse getSupervisedProductions(String search, Long farmerId, String status, UserPrincipal principal) {
        ManagerScope scope = scopeHelper.resolve(principal);
        List<Farmer> farmers = farmerRepository.findAll().stream()
                .filter(ManagerServiceImpl::isSupervisedFarmer)
                .filter(f -> scope.allowsFarmer(f.getId()))
                .toList();
        Map<Long, Farmer> farmerMap = farmers.stream()
                .collect(Collectors.toMap(Farmer::getId, Function.identity(), (a, b) -> a));

        List<Cycle> allCycles = cycleRepository.findAll();
        List<Harvest> allHarvests = harvestRepository.findAll();
        List<AnimalGroup> allAnimals = animalGroupRepository.findAll();

        Map<Long, Double> harvestedByCycle = allHarvests.stream()
                .filter(h -> h.getCycle() != null && h.getCycle().getId() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getCycle().getId(),
                        Collectors.summingDouble(ManagerServiceImpl::toKg)
                ));

        String q = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;
        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim()))
                ? status.trim().toUpperCase() : null;

        List<SupervisedCycleRow> cycleRows = allCycles.stream()
                .filter(c -> c.getFarmerId() != null && farmerMap.containsKey(c.getFarmerId()))
                .filter(c -> farmerId == null || farmerId.equals(c.getFarmerId()))
                .filter(c -> statusFilter == null || (c.getStatus() != null && c.getStatus().name().equalsIgnoreCase(statusFilter)))
                .map(c -> {
                    Farmer f = farmerMap.get(c.getFarmerId());
                    String fName = f.getFullName() != null ? f.getFullName() : "Farmer #" + f.getId();
                    String farmName = f.getFarmName() != null ? f.getFarmName() : "Main Farm";
                    String plotName = c.getPlot() != null ? c.getPlot().getName() : "Plot";
                    String cStatus = c.getStatus() != null ? c.getStatus().name() : "ACTIVE";
                    double yKg = Math.round(harvestedByCycle.getOrDefault(c.getId(), 0.0) * 10.0) / 10.0;
                    return new SupervisedCycleRow(
                            c.getId(), f.getId(), fName, farmName,
                            c.getName(), c.getCropName(), plotName, cStatus,
                            c.getStartDate(), c.getEndDate(), c.getAcreage(), yKg
                    );
                })
                .filter(row -> q == null ||
                        row.farmerName().toLowerCase().contains(q) ||
                        (row.cropName() != null && row.cropName().toLowerCase().contains(q)) ||
                        (row.name() != null && row.name().toLowerCase().contains(q)) ||
                        (row.plotName() != null && row.plotName().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(SupervisedCycleRow::startDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<SupervisedHarvestRow> harvestRows = allHarvests.stream()
                .filter(h -> getFarmerId(h) != null && farmerMap.containsKey(getFarmerId(h)))
                .filter(h -> farmerId == null || farmerId.equals(getFarmerId(h)))
                .map(h -> {
                    Farmer f = farmerMap.get(getFarmerId(h));
                    String fName = f.getFullName() != null ? f.getFullName() : "Farmer #" + f.getId();
                    String farmName = f.getFarmName() != null ? f.getFarmName() : "Main Farm";
                    Long cId = h.getCycle() != null ? h.getCycle().getId() : null;
                    String cName = h.getCycle() != null ? h.getCycle().getName() : "Cycle";
                    double qtyKg = Math.round(toKg(h) * 10.0) / 10.0;
                    return new SupervisedHarvestRow(
                            h.getId(), f.getId(), fName, farmName,
                            cId, cName, getCropName(h), qtyKg, h.getHarvestDate()
                    );
                })
                .filter(row -> q == null ||
                        row.farmerName().toLowerCase().contains(q) ||
                        (row.cropName() != null && row.cropName().toLowerCase().contains(q)) ||
                        (row.cycleName() != null && row.cycleName().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(SupervisedHarvestRow::harvestDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<SupervisedAnimalRow> animalRows = allAnimals.stream()
                .filter(ag -> ag.getFarmerId() != null && farmerMap.containsKey(ag.getFarmerId()))
                .filter(ag -> farmerId == null || farmerId.equals(ag.getFarmerId()))
                .filter(ag -> statusFilter == null || (ag.getStatus() != null && ag.getStatus().name().equalsIgnoreCase(statusFilter)))
                .map(ag -> {
                    Farmer f = farmerMap.get(ag.getFarmerId());
                    String fName = f.getFullName() != null ? f.getFullName() : "Farmer #" + f.getId();
                    String farmName = f.getFarmName() != null ? f.getFarmName() : "Main Farm";
                    String typeLabel = ag.getAnimalType() != null ? ag.getAnimalType().getDisplayName() : "Livestock";
                    String aStatus = ag.getStatus() != null ? ag.getStatus().name() : "ACTIVE";
                    return new SupervisedAnimalRow(
                            ag.getId(), f.getId(), fName, farmName,
                            ag.getName(), typeLabel, ag.getBreed(),
                            ag.getCurrentPopulation(), ag.getLocation(), aStatus
                    );
                })
                .filter(row -> q == null ||
                        row.farmerName().toLowerCase().contains(q) ||
                        (row.name() != null && row.name().toLowerCase().contains(q)) ||
                        (row.animalType() != null && row.animalType().toLowerCase().contains(q)) ||
                        (row.breed() != null && row.breed().toLowerCase().contains(q)))
                .toList();

        int activeCycles = (int) cycleRows.stream().filter(c -> "ACTIVE".equalsIgnoreCase(c.status())).count();
        int completedCycles = (int) cycleRows.stream().filter(c -> "COMPLETED".equalsIgnoreCase(c.status())).count();
        double totalHarvestKg = Math.round(harvestRows.stream().mapToDouble(SupervisedHarvestRow::quantityKg).sum() * 10.0) / 10.0;
        double totalHarvestTons = Math.round((totalHarvestKg / 1000.0) * 100.0) / 100.0;
        long totalAnimalPop = animalRows.stream().mapToLong(a -> a.currentPopulation() != null ? a.currentPopulation() : 0L).sum();

        return new ManagerProductionsResponse(
                cycleRows.size(), activeCycles, completedCycles,
                totalHarvestKg, totalHarvestTons,
                animalRows.size(), totalAnimalPop,
                cycleRows, harvestRows, animalRows
        );
    }
}
