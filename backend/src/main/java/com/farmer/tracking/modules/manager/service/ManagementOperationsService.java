package com.farmer.tracking.modules.manager.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalIncident;
import com.farmer.tracking.modules.animal.model.AnimalType;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.animal.repository.AnimalIncidentRepository;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.Crop;
import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.entity.Harvest;
import com.farmer.tracking.modules.crop.entity.HarvestUnit;
import com.farmer.tracking.modules.crop.repository.CropRepository;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.model.FarmStatus;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.manager.dto.ManagementOperationsDtos.*;
import com.farmer.tracking.modules.notification.dto.NotificationDtos.SendNotificationRequest;
import com.farmer.tracking.modules.notification.service.NotificationService;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ManagementOperationsService {

    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final AnimalGroupRepository animalGroupRepository;
    private final CycleIncidentRepository cycleIncidentRepository;
    private final AnimalIncidentRepository animalIncidentRepository;
    private final CropRepository cropRepository;
    private final CycleRepository cycleRepository;
    private final HarvestRepository harvestRepository;
    private final FarmInputRepository farmInputRepository;
    private final NotificationService notificationService;

    public ManagementOperationsService(
            FarmerRepository farmerRepository,
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            AnimalGroupRepository animalGroupRepository,
            CycleIncidentRepository cycleIncidentRepository,
            AnimalIncidentRepository animalIncidentRepository,
            CropRepository cropRepository,
            CycleRepository cycleRepository,
            HarvestRepository harvestRepository,
            FarmInputRepository farmInputRepository,
            NotificationService notificationService) {
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.animalGroupRepository = animalGroupRepository;
        this.cycleIncidentRepository = cycleIncidentRepository;
        this.animalIncidentRepository = animalIncidentRepository;
        this.cropRepository = cropRepository;
        this.cycleRepository = cycleRepository;
        this.harvestRepository = harvestRepository;
        this.farmInputRepository = farmInputRepository;
        this.notificationService = notificationService;
    }

    // ------------------------------------------------------------------ Farms

    @Transactional(readOnly = true)
    public List<ManagedFarmRow> listFarms(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, Long> plotCounts = plotRepository.findAll().stream()
                .filter(p -> p.getFarm() != null)
                .collect(Collectors.groupingBy(p -> p.getFarm().getId(), Collectors.counting()));

        return farmRepository.findAll().stream()
                .map(f -> toFarmRow(f, plotCounts.getOrDefault(f.getId(), 0L).intValue()))
                .filter(r -> q.isEmpty()
                        || r.name().toLowerCase().contains(q)
                        || r.farmerName().toLowerCase().contains(q)
                        || (r.region() != null && r.region().toLowerCase().contains(q))
                        || (r.district() != null && r.district().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedFarmRow::id).reversed())
                .toList();
    }

    @Transactional
    public ManagedFarmRow createFarm(ManagedFarmRequest req) {
        Farmer farmer = farmerRepository.findById(req.farmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
        Farm farm = new Farm();
        farm.setFarmer(farmer);
        applyFarmFields(farm, req);
        Farm saved = farmRepository.save(farm);
        return toFarmRow(saved, 0);
    }

    @Transactional
    public ManagedFarmRow updateFarm(Long id, ManagedFarmRequest req) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found."));
        if (req.farmerId() != null && !req.farmerId().equals(farm.getFarmer().getId())) {
            Farmer farmer = farmerRepository.findById(req.farmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
            farm.setFarmer(farmer);
        }
        applyFarmFields(farm, req);
        Farm saved = farmRepository.save(farm);
        int plots = (int) plotRepository.findAll().stream()
                .filter(p -> p.getFarm() != null && id.equals(p.getFarm().getId())).count();
        return toFarmRow(saved, plots);
    }

    @Transactional
    public void deleteFarm(Long id) {
        if (!farmRepository.existsById(id)) {
            throw new ResourceNotFoundException("Farm not found.");
        }
        farmRepository.deleteById(id);
    }

    private void applyFarmFields(Farm farm, ManagedFarmRequest req) {
        farm.setName(req.name().trim());
        farm.setType(parseFarmType(req.type()));
        farm.setSize(req.size() != null && req.size() > 0 ? req.size() : 1.0);
        farm.setSizeUnit(parseSizeUnit(req.sizeUnit()));
        farm.setStatus(parseFarmStatus(req.status()));
        farm.setCountry(nonBlankOr(req.country(), "Cameroon"));
        farm.setRegion(nonBlankOr(req.region(), "Central"));
        farm.setDistrict(nonBlankOr(req.district(), "Main"));
        farm.setDescription(req.description() != null ? req.description().trim() : null);
    }

    private ManagedFarmRow toFarmRow(Farm f, int plotCount) {
        return new ManagedFarmRow(
                f.getId(),
                f.getFarmer().getId(),
                f.getFarmer().getFullName(),
                f.getName(),
                f.getType() != null ? f.getType().name() : "MIXED",
                f.getSize(),
                f.getSizeUnit() != null ? f.getSizeUnit().name() : "HECTARES",
                f.getStatus() != null ? f.getStatus().name() : "ACTIVE",
                f.getCountry(),
                f.getRegion(),
                f.getDistrict(),
                f.getDescription(),
                plotCount,
                f.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Plots

    @Transactional(readOnly = true)
    public List<ManagedPlotRow> listPlots(String search, Long farmId) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, Farmer> farmers = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Function.identity(), (a, b) -> a));
        Map<Long, Farm> farms = farmRepository.findAll().stream()
                .collect(Collectors.toMap(Farm::getId, Function.identity(), (a, b) -> a));

        return plotRepository.findAll().stream()
                .filter(p -> farmId == null || (p.getFarm() != null && farmId.equals(p.getFarm().getId())))
                .map(p -> toPlotRow(p, farmers.get(p.getFarmerId()), p.getFarm()))
                .filter(r -> q.isEmpty()
                        || r.name().toLowerCase().contains(q)
                        || r.farmerName().toLowerCase().contains(q)
                        || (r.farmName() != null && r.farmName().toLowerCase().contains(q))
                        || (r.cropType() != null && r.cropType().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedPlotRow::id).reversed())
                .toList();
    }

    @Transactional
    public ManagedPlotRow createPlot(ManagedPlotRequest req) {
        Farmer farmer = farmerRepository.findById(req.farmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
        Plot plot = new Plot();
        plot.setFarmerId(farmer.getId());
        applyPlotFields(plot, req);
        Plot saved = plotRepository.save(plot);
        return toPlotRow(saved, farmer, saved.getFarm());
    }

    @Transactional
    public ManagedPlotRow updatePlot(Long id, ManagedPlotRequest req) {
        Plot plot = plotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plot not found."));
        if (req.farmerId() != null) {
            farmerRepository.findById(req.farmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
            plot.setFarmerId(req.farmerId());
        }
        applyPlotFields(plot, req);
        Plot saved = plotRepository.save(plot);
        Farmer farmer = farmerRepository.findById(saved.getFarmerId()).orElse(null);
        return toPlotRow(saved, farmer, saved.getFarm());
    }

    @Transactional
    public void deletePlot(Long id) {
        if (!plotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plot not found.");
        }
        plotRepository.deleteById(id);
    }

    private void applyPlotFields(Plot plot, ManagedPlotRequest req) {
        if (req.farmId() != null) {
            Farm farm = farmRepository.findById(req.farmId()).orElse(null);
            plot.setFarm(farm);
        } else {
            plot.setFarm(null);
        }
        plot.setName(req.name().trim());
        plot.setArea(req.area() != null && req.area() > 0 ? req.area() : 1.0);
        plot.setLocation(req.location().trim());
        plot.setCropType(nonBlankOr(req.cropType(), "Unspecified"));
        plot.setStage(nonBlankOr(req.stage(), "Planned"));
        plot.setSoilType(blankToNull(req.soilType()));
        plot.setIrrigationType(blankToNull(req.irrigationType()));
        plot.setSlope(blankToNull(req.slope()));
        plot.setNotes(blankToNull(req.notes()));
        plot.setAnimalGroupId(req.animalGroupId());
        if (req.animalGroupId() != null) {
            if (req.animalGroupName() != null && !req.animalGroupName().isBlank()) {
                plot.setAnimalGroupName(req.animalGroupName().trim());
            } else {
                animalGroupRepository.findById(req.animalGroupId())
                        .ifPresent(g -> plot.setAnimalGroupName(g.getName()));
            }
        } else {
            plot.setAnimalGroupName(null);
        }
    }

    private ManagedPlotRow toPlotRow(Plot p, Farmer farmer, Farm farm) {
        return new ManagedPlotRow(
                p.getId(),
                p.getFarmerId(),
                farmer != null ? farmer.getFullName() : "Farmer #" + p.getFarmerId(),
                p.getFarm() != null ? p.getFarm().getId() : null,
                farm != null ? farm.getName() : null,
                p.getName(),
                p.getArea(),
                p.getLocation(),
                p.getCropType(),
                p.getStage(),
                p.getSoilType(),
                p.getIrrigationType(),
                p.getSlope(),
                p.getNotes(),
                p.getAnimalGroupId(),
                p.getAnimalGroupName(),
                p.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Animal Groups

    @Transactional(readOnly = true)
    public List<ManagedAnimalGroupRow> listAnimalGroups(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        return animalGroupRepository.findAll().stream()
                .map(this::toAnimalGroupRow)
                .filter(r -> q.isEmpty()
                        || r.name().toLowerCase().contains(q)
                        || r.farmerName().toLowerCase().contains(q)
                        || r.animalType().toLowerCase().contains(q)
                        || (r.breed() != null && r.breed().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedAnimalGroupRow::id).reversed())
                .toList();
    }

    @Transactional
    public ManagedAnimalGroupRow createAnimalGroup(ManagedAnimalGroupRequest req) {
        Farmer farmer = farmerRepository.findById(req.farmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
        AnimalGroup group = new AnimalGroup();
        group.setFarmer(farmer);
        applyAnimalGroupFields(group, req);
        return toAnimalGroupRow(animalGroupRepository.save(group));
    }

    @Transactional
    public ManagedAnimalGroupRow updateAnimalGroup(Long id, ManagedAnimalGroupRequest req) {
        AnimalGroup group = animalGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found."));
        if (req.farmerId() != null && !req.farmerId().equals(group.getFarmer().getId())) {
            Farmer farmer = farmerRepository.findById(req.farmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
            group.setFarmer(farmer);
        }
        applyAnimalGroupFields(group, req);
        return toAnimalGroupRow(animalGroupRepository.save(group));
    }

    @Transactional
    public void deleteAnimalGroup(Long id) {
        if (!animalGroupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Animal group not found.");
        }
        animalGroupRepository.deleteById(id);
    }

    private void applyAnimalGroupFields(AnimalGroup g, ManagedAnimalGroupRequest req) {
        if (req.farmId() != null) {
            Farm farm = farmRepository.findById(req.farmId()).orElse(null);
            g.setFarm(farm);
        } else {
            g.setFarm(null);
        }
        g.setName(req.name().trim());
        g.setAnimalType(AnimalType.fromString(req.animalType()));
        g.setBreed(blankToNull(req.breed()));
        int initPop = req.initialPopulation() != null ? Math.max(0, req.initialPopulation()) : 0;
        int currPop = req.currentPopulation() != null ? Math.max(0, req.currentPopulation()) : initPop;
        g.setInitialPopulation(initPop);
        g.setCurrentPopulation(currPop);
        g.setNumberOfAnimals(currPop);
        g.setLocation(blankToNull(req.location()));
        g.setPurpose(blankToNull(req.purpose()));
        g.setStatus(AnimalGroupStatus.fromString(req.status()));
        g.setHealthStatus(blankToNull(req.healthStatus()));
        g.setNotes(blankToNull(req.notes()));
        g.setStartDate(req.startDate());
    }

    private ManagedAnimalGroupRow toAnimalGroupRow(AnimalGroup g) {
        return new ManagedAnimalGroupRow(
                g.getId(),
                g.getFarmer().getId(),
                g.getFarmer().getFullName(),
                g.getFarm() != null ? g.getFarm().getId() : null,
                g.getFarm() != null ? g.getFarm().getName() : null,
                g.getName(),
                g.getAnimalType() != null ? g.getAnimalType().name() : "OTHER",
                g.getBreed(),
                g.getInitialPopulation(),
                g.getCurrentPopulation(),
                g.getLocation(),
                g.getPurpose(),
                g.getStatus() != null ? g.getStatus().name() : "ACTIVE",
                g.getHealthStatus(),
                g.getNotes(),
                g.getStartDate(),
                g.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Incidents

    @Transactional(readOnly = true)
    public List<ManagedIncidentRow> listIncidents(String kind, String status, String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        String k = kind != null ? kind.trim().toUpperCase() : "";
        String st = status != null ? status.trim().toUpperCase() : "";

        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));

        List<ManagedIncidentRow> all = new ArrayList<>();

        if (k.isEmpty() || "CROP".equals(k)) {
            for (CycleIncident ci : cycleIncidentRepository.findAll()) {
                String targetName = ci.getCycle() != null && ci.getCycle().getCropName() != null
                        ? ci.getCycle().getCropName()
                        : "Crop Cycle #" + (ci.getCycle() != null ? ci.getCycle().getId() : "?");
                all.add(new ManagedIncidentRow(
                        ci.getId(),
                        "CROP",
                        ci.getFarmerId(),
                        farmerNames.getOrDefault(ci.getFarmerId(), "Farmer #" + ci.getFarmerId()),
                        targetName,
                        ci.getIncidentType() != null ? ci.getIncidentType().name() : "OTHER",
                        ci.getIncidentDate(),
                        ci.getSeverityLevel(),
                        null,
                        ci.getDescription(),
                        ci.getActionTaken(),
                        ci.getStatus(),
                        ci.getResolvedBy(),
                        ci.getResolvedAt(),
                        ci.getCreatedAt()
                ));
            }
        }

        if (k.isEmpty() || "ANIMAL".equals(k)) {
            for (AnimalIncident ai : animalIncidentRepository.findAll()) {
                String targetName = ai.getAnimalGroup() != null
                        ? ai.getAnimalGroup().getName()
                        : "Animal Group";
                all.add(new ManagedIncidentRow(
                        ai.getId(),
                        "ANIMAL",
                        ai.getFarmerId(),
                        farmerNames.getOrDefault(ai.getFarmerId(), "Farmer #" + ai.getFarmerId()),
                        targetName,
                        ai.getIncidentType(),
                        ai.getIncidentDate(),
                        ai.getSeverityLevel(),
                        ai.getAffectedCount(),
                        ai.getDescription(),
                        ai.getActionTaken(),
                        ai.getStatus(),
                        ai.getResolvedBy(),
                        ai.getResolvedAt(),
                        ai.getCreatedAt()
                ));
            }
        }

        return all.stream()
                .filter(r -> st.isEmpty() || st.equalsIgnoreCase(r.status()))
                .filter(r -> q.isEmpty()
                        || r.farmerName().toLowerCase().contains(q)
                        || r.targetName().toLowerCase().contains(q)
                        || (r.incidentType() != null && r.incidentType().toLowerCase().contains(q))
                        || (r.description() != null && r.description().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedIncidentRow::incidentDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ManagedIncidentRow::id, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional
    public ManagedIncidentRow takeIncidentAction(String kind, Long id, IncidentActionRequest req, String actorName, Long actorId) {
        String normalizedKind = kind != null ? kind.trim().toUpperCase() : "";
        String normalizedStatus = req.status().trim().toUpperCase();
        if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED").contains(normalizedStatus)) {
            throw new BadRequestException("Invalid incident status. Use OPEN, IN_PROGRESS, RESOLVED, or DISMISSED.");
        }

        Long farmerId;
        String targetName;
        ManagedIncidentRow updatedRow;

        if ("CROP".equals(normalizedKind)) {
            CycleIncident ci = cycleIncidentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Crop incident not found."));
            ci.setStatus(normalizedStatus);
            ci.setActionTaken(req.actionTaken().trim());
            ci.setResolvedBy(actorName);
            ci.setResolvedAt("RESOLVED".equals(normalizedStatus) || "DISMISSED".equals(normalizedStatus)
                    ? LocalDateTime.now() : null);
            CycleIncident saved = cycleIncidentRepository.save(ci);
            farmerId = saved.getFarmerId();
            targetName = saved.getCycle() != null && saved.getCycle().getCropName() != null
                    ? saved.getCycle().getCropName() : "Crop Cycle";
            String farmerName = farmerRepository.findById(farmerId).map(Farmer::getFullName).orElse("Farmer #" + farmerId);
            updatedRow = new ManagedIncidentRow(
                    saved.getId(), "CROP", farmerId, farmerName, targetName,
                    saved.getIncidentType() != null ? saved.getIncidentType().name() : "OTHER",
                    saved.getIncidentDate(), saved.getSeverityLevel(), null,
                    saved.getDescription(), saved.getActionTaken(), saved.getStatus(),
                    saved.getResolvedBy(), saved.getResolvedAt(), saved.getCreatedAt()
            );
        } else if ("ANIMAL".equals(normalizedKind)) {
            AnimalIncident ai = animalIncidentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Animal incident not found."));
            ai.setStatus(normalizedStatus);
            ai.setActionTaken(req.actionTaken().trim());
            ai.setResolvedBy(actorName);
            ai.setResolvedAt("RESOLVED".equals(normalizedStatus) || "DISMISSED".equals(normalizedStatus)
                    ? LocalDateTime.now() : null);
            AnimalIncident saved = animalIncidentRepository.save(ai);
            farmerId = saved.getFarmerId();
            targetName = saved.getAnimalGroup() != null ? saved.getAnimalGroup().getName() : "Animal Group";
            String farmerName = farmerRepository.findById(farmerId).map(Farmer::getFullName).orElse("Farmer #" + farmerId);
            updatedRow = new ManagedIncidentRow(
                    saved.getId(), "ANIMAL", farmerId, farmerName, targetName,
                    saved.getIncidentType(), saved.getIncidentDate(), saved.getSeverityLevel(),
                    saved.getAffectedCount(), saved.getDescription(), saved.getActionTaken(),
                    saved.getStatus(), saved.getResolvedBy(), saved.getResolvedAt(), saved.getCreatedAt()
            );
        } else {
            throw new BadRequestException("Incident kind must be CROP or ANIMAL.");
        }

        if (req.notifyFarmer()) {
            String msg = (req.notificationMessage() != null && !req.notificationMessage().isBlank())
                    ? req.notificationMessage().trim()
                    : "Incident on " + targetName + " marked " + normalizedStatus + ". Action: " + req.actionTaken().trim();
            notificationService.send(
                    actorId,
                    actorName,
                    new SendNotificationRequest(farmerId, null, "Incident Action: " + targetName, msg, "ACTION")
            );
        }

        return updatedRow;
    }

    // ------------------------------------------------------------------ Crops

    @Transactional(readOnly = true)
    public List<ManagedCropRow> listCrops(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));

        return cropRepository.findAll().stream()
                .map(c -> toCropRow(c, farmerNames.getOrDefault(c.getFarmerId(), "Farmer #" + c.getFarmerId())))
                .filter(r -> q.isEmpty()
                        || r.name().toLowerCase().contains(q)
                        || r.farmerName().toLowerCase().contains(q)
                        || (r.variety() != null && r.variety().toLowerCase().contains(q))
                        || (r.category() != null && r.category().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedCropRow::id).reversed())
                .toList();
    }

    @Transactional
    public ManagedCropRow createCrop(ManagedCropRequest req) {
        Farmer farmer = farmerRepository.findById(req.farmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
        Crop crop = new Crop();
        crop.setFarmerId(farmer.getId());
        applyCropFields(crop, req);
        return toCropRow(cropRepository.save(crop), farmer.getFullName());
    }

    @Transactional
    public ManagedCropRow updateCrop(Long id, ManagedCropRequest req) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found."));
        if (req.farmerId() != null) {
            farmerRepository.findById(req.farmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
            crop.setFarmerId(req.farmerId());
        }
        applyCropFields(crop, req);
        Crop saved = cropRepository.save(crop);
        String farmerName = farmerRepository.findById(saved.getFarmerId()).map(Farmer::getFullName).orElse("Farmer");
        return toCropRow(saved, farmerName);
    }

    @Transactional
    public void deleteCrop(Long id) {
        if (!cropRepository.existsById(id)) {
            throw new ResourceNotFoundException("Crop not found.");
        }
        cropRepository.deleteById(id);
    }

    private void applyCropFields(Crop c, ManagedCropRequest req) {
        c.setName(req.name().trim());
        c.setVariety(blankToNull(req.variety()));
        c.setCategory(blankToNull(req.category()));
        c.setGrowthDurationDays(req.growthDurationDays());
        c.setExpectedYieldPerHectare(req.expectedYieldPerHectare());
        c.setYieldUnit(blankToNull(req.yieldUnit()));
        c.setPlantingSeason(blankToNull(req.plantingSeason()));
        c.setWaterRequirement(blankToNull(req.waterRequirement()));
        c.setSoilPreference(blankToNull(req.soilPreference()));
        c.setDescription(blankToNull(req.description()));
    }

    private ManagedCropRow toCropRow(Crop c, String farmerName) {
        return new ManagedCropRow(
                c.getId(),
                c.getFarmerId(),
                farmerName,
                c.getName(),
                c.getVariety(),
                c.getCategory(),
                c.getGrowthDurationDays(),
                c.getExpectedYieldPerHectare(),
                c.getYieldUnit(),
                c.getPlantingSeason(),
                c.getWaterRequirement(),
                c.getSoilPreference(),
                c.getDescription(),
                c.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Harvests

    @Transactional(readOnly = true)
    public List<SimpleCycleOption> listCycleOptions() {
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));
        return cycleRepository.findAll().stream()
                .map(c -> new SimpleCycleOption(
                        c.getId(),
                        c.getName(),
                        c.getCropName(),
                        c.getFarmerId(),
                        farmerNames.getOrDefault(c.getFarmerId(), "Farmer #" + c.getFarmerId())))
                .sorted(Comparator.comparing(SimpleCycleOption::id).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ManagedHarvestRow> listHarvests(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));

        return harvestRepository.findAll().stream()
                .map(h -> toHarvestRow(h, farmerNames))
                .filter(r -> q.isEmpty()
                        || (r.cropName() != null && r.cropName().toLowerCase().contains(q))
                        || r.farmerName().toLowerCase().contains(q)
                        || (r.cycleName() != null && r.cycleName().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedHarvestRow::harvestDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ManagedHarvestRow::id, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional
    public ManagedHarvestRow createHarvest(ManagedHarvestRequest req) {
        Cycle cycle = cycleRepository.findById(req.cycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Production cycle not found."));
        Harvest h = new Harvest();
        h.setCycle(cycle);
        applyHarvestFields(h, cycle, req);
        Harvest saved = harvestRepository.save(h);
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));
        return toHarvestRow(saved, farmerNames);
    }

    @Transactional
    public ManagedHarvestRow updateHarvest(Long id, ManagedHarvestRequest req) {
        Harvest h = harvestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Harvest not found."));
        Cycle cycle = h.getCycle();
        if (req.cycleId() != null && (cycle == null || !req.cycleId().equals(cycle.getId()))) {
            cycle = cycleRepository.findById(req.cycleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Production cycle not found."));
            h.setCycle(cycle);
        }
        applyHarvestFields(h, cycle, req);
        Harvest saved = harvestRepository.save(h);
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));
        return toHarvestRow(saved, farmerNames);
    }

    @Transactional
    public void deleteHarvest(Long id) {
        if (!harvestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Harvest not found.");
        }
        harvestRepository.deleteById(id);
    }

    private void applyHarvestFields(Harvest h, Cycle cycle, ManagedHarvestRequest req) {
        h.setQuantity(req.quantity() != null ? req.quantity() : 0.0);
        HarvestUnit unit = HarvestUnit.KG;
        if (req.unit() != null && !req.unit().isBlank()) {
            try {
                unit = HarvestUnit.valueOf(req.unit().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        h.setUnit(unit);
        h.setHarvestDate(req.harvestDate() != null ? req.harvestDate() : java.time.LocalDate.now());
        if (cycle != null && cycle.getAcreage() != null && cycle.getAcreage() > 0) {
            h.setCalculatedYield(h.getQuantity() / cycle.getAcreage());
        }
        h.setQualityGrade(blankToNull(req.qualityGrade()));
        h.setMarketDestination(blankToNull(req.marketDestination()));
        h.setEstimatedRevenue(req.estimatedRevenue());
        h.setNotes(blankToNull(req.notes()));
    }

    private ManagedHarvestRow toHarvestRow(Harvest h, Map<Long, String> farmerNames) {
        Cycle c = h.getCycle();
        Long fId = c != null ? c.getFarmerId() : null;
        return new ManagedHarvestRow(
                h.getId(),
                c != null ? c.getId() : null,
                c != null ? c.getName() : null,
                c != null ? c.getCropName() : null,
                fId,
                fId != null ? farmerNames.getOrDefault(fId, "Farmer #" + fId) : "Farmer",
                h.getQuantity(),
                h.getUnit() != null ? h.getUnit().name() : "KG",
                h.getHarvestDate(),
                h.getCalculatedYield(),
                h.getQualityGrade(),
                h.getMarketDestination(),
                h.getEstimatedRevenue(),
                h.getNotes(),
                h.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Farm Inputs

    @Transactional(readOnly = true)
    public List<ManagedInputRow> listInputs(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, String> farmerNames = farmerRepository.findAll().stream()
                .collect(Collectors.toMap(Farmer::getId, Farmer::getFullName, (a, b) -> a));

        return farmInputRepository.findAll().stream()
                .map(i -> toInputRow(i, farmerNames.getOrDefault(i.getFarmerId(), "Farmer #" + i.getFarmerId())))
                .filter(r -> q.isEmpty()
                        || r.name().toLowerCase().contains(q)
                        || r.farmerName().toLowerCase().contains(q)
                        || r.type().toLowerCase().contains(q)
                        || (r.supplier() != null && r.supplier().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(ManagedInputRow::id).reversed())
                .toList();
    }

    @Transactional
    public ManagedInputRow createInput(ManagedInputRequest req) {
        Farmer farmer = farmerRepository.findById(req.farmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
        FarmInput input = new FarmInput();
        input.setFarmerId(farmer.getId());
        applyInputFields(input, req);
        return toInputRow(farmInputRepository.save(input), farmer.getFullName());
    }

    @Transactional
    public ManagedInputRow updateInput(Long id, ManagedInputRequest req) {
        FarmInput input = farmInputRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input not found."));
        if (req.farmerId() != null) {
            farmerRepository.findById(req.farmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));
            input.setFarmerId(req.farmerId());
        }
        applyInputFields(input, req);
        FarmInput saved = farmInputRepository.save(input);
        String farmerName = farmerRepository.findById(saved.getFarmerId()).map(Farmer::getFullName).orElse("Farmer");
        return toInputRow(saved, farmerName);
    }

    @Transactional
    public void deleteInput(Long id) {
        if (!farmInputRepository.existsById(id)) {
            throw new ResourceNotFoundException("Farm input not found.");
        }
        farmInputRepository.deleteById(id);
    }

    private void applyInputFields(FarmInput i, ManagedInputRequest req) {
        i.setName(req.name().trim());
        InputType t = InputType.OTHER;
        if (req.type() != null && !req.type().isBlank()) {
            try {
                t = InputType.valueOf(req.type().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        i.setType(t);
        i.setQuantity(req.quantity() != null ? req.quantity() : 0.0);
        i.setUnit(nonBlankOr(req.unit(), "kg"));
        i.setPurchaseDate(req.purchaseDate() != null ? req.purchaseDate() : java.time.LocalDate.now());
        i.setPurchasePrice(req.purchasePrice() != null ? req.purchasePrice() : 0.0);
        double cumCost = req.cumulativeCost() != null ? req.cumulativeCost() : (i.getPurchasePrice() * Math.max(1.0, i.getQuantity()));
        i.setCumulativeCost(cumCost);
        i.setBrand(blankToNull(req.brand()));
        i.setSupplier(blankToNull(req.supplier()));
        i.setStorageLocation(blankToNull(req.storageLocation()));
        i.setDescription(blankToNull(req.description()));
    }

    private ManagedInputRow toInputRow(FarmInput i, String farmerName) {
        return new ManagedInputRow(
                i.getId(),
                i.getFarmerId(),
                farmerName,
                i.getName(),
                i.getType() != null ? i.getType().name() : "OTHER",
                i.getQuantity(),
                i.getUnit(),
                i.getPurchaseDate(),
                i.getPurchasePrice(),
                i.getCumulativeCost(),
                i.getBrand(),
                i.getSupplier(),
                i.getStorageLocation(),
                i.getDescription(),
                i.getCreatedAt()
        );
    }

    // ------------------------------------------------------------------ Helpers

    private static FarmType parseFarmType(String value) {
        if (value == null || value.isBlank()) return FarmType.MIXED;
        try {
            return FarmType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return FarmType.MIXED;
        }
    }

    private static SizeUnit parseSizeUnit(String value) {
        if (value == null || value.isBlank()) return SizeUnit.HECTARES;
        try {
            return SizeUnit.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return SizeUnit.HECTARES;
        }
    }

    private static FarmStatus parseFarmStatus(String value) {
        if (value == null || value.isBlank()) return FarmStatus.ACTIVE;
        try {
            return FarmStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return FarmStatus.ACTIVE;
        }
    }

    private static String nonBlankOr(String val, String fallback) {
        return (val != null && !val.trim().isEmpty()) ? val.trim() : fallback;
    }

    private static String blankToNull(String val) {
        return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
    }
}

