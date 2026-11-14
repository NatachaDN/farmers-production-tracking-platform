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
import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.model.FarmStatus;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
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
    private final NotificationService notificationService;

    public ManagementOperationsService(
            FarmerRepository farmerRepository,
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            AnimalGroupRepository animalGroupRepository,
            CycleIncidentRepository cycleIncidentRepository,
            AnimalIncidentRepository animalIncidentRepository,
            NotificationService notificationService) {
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.animalGroupRepository = animalGroupRepository;
        this.cycleIncidentRepository = cycleIncidentRepository;
        this.animalIncidentRepository = animalIncidentRepository;
        this.notificationService = notificationService;
    }

    // ------------------------------------------------------------------ Farms

    @Transactional(readOnly = true)
    public List<ManagedFarmRow> listFarms(String search) {
        String q = search != null ? search.trim().toLowerCase() : "";
        Map<Long, Long> plotCounts = plotRepository.findAll().stream()
                .filter(p -> p.getFarmId() != null)
                .collect(Collectors.groupingBy(Plot::getFarmId, Collectors.counting()));

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
        int plots = (int) plotRepository.findAll().stream().filter(p -> id.equals(p.getFarmId())).count();
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
                .filter(p -> farmId == null || farmId.equals(p.getFarmId()))
                .map(p -> toPlotRow(p, farmers.get(p.getFarmerId()), p.getFarmId() != null ? farms.get(p.getFarmId()) : null))
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
        Farm farm = saved.getFarmId() != null ? farmRepository.findById(saved.getFarmId()).orElse(null) : null;
        return toPlotRow(saved, farmer, farm);
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
        Farm farm = saved.getFarmId() != null ? farmRepository.findById(saved.getFarmId()).orElse(null) : null;
        return toPlotRow(saved, farmer, farm);
    }

    @Transactional
    public void deletePlot(Long id) {
        if (!plotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plot not found.");
        }
        plotRepository.deleteById(id);
    }

    private void applyPlotFields(Plot plot, ManagedPlotRequest req) {
        plot.setFarmId(req.farmId());
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
                p.getFarmId(),
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
                String targetName = ci.getCycle() != null && ci.getCycle().getCrop() != null
                        ? ci.getCycle().getCrop().getDisplayName()
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
            targetName = saved.getCycle() != null && saved.getCycle().getCrop() != null
                    ? saved.getCycle().getCrop().getDisplayName() : "Crop Cycle";
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

