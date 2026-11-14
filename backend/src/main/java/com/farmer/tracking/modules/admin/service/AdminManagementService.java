package com.farmer.tracking.modules.admin.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.modules.admin.api.AdminDtos.*;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalIncident;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.animal.repository.AnimalIncidentRepository;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.RegistrationStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.*;
import com.farmer.tracking.modules.crop.repository.CycleActivityRepository;
import com.farmer.tracking.modules.crop.repository.CycleIncidentRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.crop.repository.HarvestRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminManagementService {

    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;
    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final AnimalGroupRepository animalGroupRepository;
    private final CycleRepository cycleRepository;
    private final CycleActivityRepository activityRepository;
    private final HarvestRepository harvestRepository;
    private final FarmInputRepository inputRepository;
    private final CycleIncidentRepository cycleIncidentRepository;
    private final AnimalIncidentRepository animalIncidentRepository;

    public AdminManagementService(
            FarmerRepository farmerRepository,
            PasswordEncoder passwordEncoder,
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            AnimalGroupRepository animalGroupRepository,
            CycleRepository cycleRepository,
            CycleActivityRepository activityRepository,
            HarvestRepository harvestRepository,
            FarmInputRepository inputRepository,
            CycleIncidentRepository cycleIncidentRepository,
            AnimalIncidentRepository animalIncidentRepository) {
        this.farmerRepository = farmerRepository;
        this.passwordEncoder = passwordEncoder;
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.animalGroupRepository = animalGroupRepository;
        this.cycleRepository = cycleRepository;
        this.activityRepository = activityRepository;
        this.harvestRepository = harvestRepository;
        this.inputRepository = inputRepository;
        this.cycleIncidentRepository = cycleIncidentRepository;
        this.animalIncidentRepository = animalIncidentRepository;
    }

    // ------------------------------------------------------------------ Users CRUD

    @Transactional(readOnly = true)
    public List<AdminUserRow> listUsers(String role, String status, String q) {
        String search = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";
        String roleFilter = role != null ? role.trim().toUpperCase(Locale.ROOT) : "";
        String statusFilter = status != null ? status.trim().toUpperCase(Locale.ROOT) : "";

        Map<Long, List<Farm>> farmsByManager = farmRepository.findAll().stream()
                .filter(f -> f.getManager() != null)
                .collect(Collectors.groupingBy(f -> f.getManager().getId()));

        return farmerRepository.findAll().stream()
                .filter(u -> roleFilter.isEmpty() || roleFilter.equalsIgnoreCase(u.getRole()))
                .filter(u -> statusFilter.isEmpty() || (u.getStatus() != null && statusFilter.equalsIgnoreCase(u.getStatus().name())))
                .filter(u -> search.isEmpty()
                        || (u.getFullName() != null && u.getFullName().toLowerCase(Locale.ROOT).contains(search))
                        || (u.getEmailOrPhone() != null && u.getEmailOrPhone().toLowerCase(Locale.ROOT).contains(search))
                        || (u.getLocation() != null && u.getLocation().toLowerCase(Locale.ROOT).contains(search)))
                .sorted(Comparator.comparing(Farmer::getId).reversed())
                .map(u -> toUserRow(u, farmsByManager.getOrDefault(u.getId(), List.of())))
                .toList();
    }

    @Transactional
    public AdminUserRow createUser(CreateUserRequest req) {
        if (req.fullName() == null || req.fullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }
        if (req.emailOrPhone() == null || req.emailOrPhone().isBlank()) {
            throw new BadRequestException("Email or phone is required.");
        }
        if (req.password() == null || req.password().length() < 4) {
            throw new BadRequestException("Password must be at least 4 characters.");
        }

        String identifier = req.emailOrPhone().trim().toLowerCase(Locale.ROOT);
        if (farmerRepository.existsByEmailOrPhone(identifier)) {
            throw new ConflictException("An account with this email or phone already exists.");
        }

        String role = normalizeRole(req.role());
        Farmer user = new Farmer();
        user.setFullName(req.fullName().trim());
        user.setEmailOrPhone(identifier);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(role);
        user.setLocation(req.location() != null && !req.location().isBlank() ? req.location().trim() : null);
        user.setFarmName(req.farmName() != null && !req.farmName().isBlank() ? req.farmName().trim() : null);
        user.setFarmType(parseFarmType(req.farmType()));
        user.setStatus(RegistrationStatus.fromString(req.status()));
        user.setAuthProvider("LOCAL");
        user.setAgreedToTerms(true);

        Farmer saved = farmerRepository.save(user);
        syncManagedFarms(saved, req.managedFarmIds());
        return toUserRow(saved, farmRepository.findByManagerId(saved.getId()));
    }

    @Transactional
    public AdminUserRow updateUser(Long id, UpdateUserRequest req) {
        Farmer user = farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (req.fullName() != null && !req.fullName().isBlank()) {
            user.setFullName(req.fullName().trim());
        }
        if (req.emailOrPhone() != null && !req.emailOrPhone().isBlank()) {
            String nextId = req.emailOrPhone().trim().toLowerCase(Locale.ROOT);
            if (!nextId.equals(user.getEmailOrPhone()) && farmerRepository.existsByEmailOrPhone(nextId)) {
                throw new ConflictException("Another account already uses this email or phone.");
            }
            user.setEmailOrPhone(nextId);
        }
        if (req.role() != null && !req.role().isBlank()) {
            user.setRole(normalizeRole(req.role()));
        }
        if (req.location() != null) {
            user.setLocation(req.location().isBlank() ? null : req.location().trim());
        }
        if (req.farmName() != null) {
            user.setFarmName(req.farmName().isBlank() ? null : req.farmName().trim());
        }
        if (req.farmType() != null && !req.farmType().isBlank()) {
            user.setFarmType(parseFarmType(req.farmType()));
        }
        if (req.status() != null && !req.status().isBlank()) {
            user.setStatus(RegistrationStatus.fromString(req.status()));
        }
        if (req.newPassword() != null && !req.newPassword().isBlank()) {
            if (req.newPassword().length() < 4) {
                throw new BadRequestException("Password must be at least 4 characters.");
            }
            user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        }

        Farmer saved = farmerRepository.save(user);
        syncManagedFarms(saved, req.managedFarmIds());
        return toUserRow(saved, farmRepository.findByManagerId(saved.getId()));
    }

    @Transactional
    public AdminUserRow updateUserStatus(Long id, UpdateUserStatusRequest req, String adminEmailOrPhone) {
        Farmer user = farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (adminEmailOrPhone != null && adminEmailOrPhone.equalsIgnoreCase(user.getEmailOrPhone())) {
            throw new BadRequestException("You cannot suspend or reject your own administrator account.");
        }

        RegistrationStatus nextStatus = RegistrationStatus.fromString(req.status());
        user.setStatus(nextStatus);
        if (nextStatus == RegistrationStatus.SUSPENDED || nextStatus == RegistrationStatus.REJECTED) {
            user.setRejectionReason(req.reason() != null && !req.reason().isBlank() ? req.reason().trim() : null);
        } else {
            user.setRejectionReason(null);
        }
        return toUserRow(farmerRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, String adminEmailOrPhone) {
        Farmer user = farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if (adminEmailOrPhone != null && adminEmailOrPhone.equalsIgnoreCase(user.getEmailOrPhone())) {
            throw new BadRequestException("You cannot delete your own administrator account.");
        }
        List<Farm> managed = farmRepository.findByManagerId(user.getId());
        if (!managed.isEmpty()) {
            managed.forEach(f -> f.setManager(null));
            farmRepository.saveAll(managed);
        }
        farmerRepository.delete(user);
    }

    // ------------------------------------------------------------------ Activities CRUD

    @Transactional
    public ActivityRow createActivity(AdminActivityRequest req) {
        if (req.cycleId() == null) {
            throw new BadRequestException("Cycle ID is required.");
        }
        Cycle cycle = cycleRepository.findById(req.cycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Production cycle not found."));
        CycleActivity activity = new CycleActivity();
        activity.setCycle(cycle);
        activity.setActivityType(parseActivityType(req.activityType()));
        activity.setActivityDate(req.activityDate() != null ? req.activityDate() : LocalDate.now());
        activity.setNotes(req.notes() != null && !req.notes().isBlank() ? req.notes().trim() : null);
        CycleActivity saved = activityRepository.save(activity);
        return toActivityRow(saved);
    }

    @Transactional
    public ActivityRow updateActivity(Long id, AdminActivityRequest req) {
        CycleActivity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found."));
        if (req.cycleId() != null && !req.cycleId().equals(activity.getCycle().getId())) {
            Cycle cycle = cycleRepository.findById(req.cycleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Production cycle not found."));
            activity.setCycle(cycle);
        }
        if (req.activityType() != null && !req.activityType().isBlank()) {
            activity.setActivityType(parseActivityType(req.activityType()));
        }
        if (req.activityDate() != null) {
            activity.setActivityDate(req.activityDate());
        }
        if (req.notes() != null) {
            activity.setNotes(req.notes().isBlank() ? null : req.notes().trim());
        }
        return toActivityRow(activityRepository.save(activity));
    }

    @Transactional
    public void deleteActivity(Long id) {
        if (!activityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Activity not found.");
        }
        activityRepository.deleteById(id);
    }

    // ------------------------------------------------------------------ Production Management

    @Transactional
    public void updateCycle(Long id, AdminCycleUpdateRequest req) {
        Cycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production cycle not found."));
        if (req.status() != null && !req.status().isBlank()) {
            try {
                cycle.setStatus(CycleStatus.valueOf(req.status().trim().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid cycle status.");
            }
        }
        if (req.stage() != null && !req.stage().isBlank()) {
            cycle.setStage(req.stage().trim());
        }
        if (req.progress() != null) {
            cycle.setProgress(Math.max(0, Math.min(100, req.progress())));
        }
        cycleRepository.save(cycle);
    }

    @Transactional
    public void deleteCycle(Long id) {
        if (!cycleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Production cycle not found.");
        }
        cycleRepository.deleteById(id);
    }

    @Transactional
    public void deleteHarvest(Long id) {
        if (!harvestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Harvest record not found.");
        }
        harvestRepository.deleteById(id);
    }

    // ------------------------------------------------------------------ Global Analytics

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse analytics() {
        List<Farmer> users = farmerRepository.findAll();
        List<Farm> farms = farmRepository.findAll();
        List<Plot> plots = plotRepository.findAll();
        List<AnimalGroup> animalGroups = animalGroupRepository.findAll();
        List<Cycle> cycles = cycleRepository.findAll();
        List<CycleActivity> activities = activityRepository.findAll();
        List<Harvest> harvests = harvestRepository.findAll();
        List<FarmInput> inputs = inputRepository.findAll();
        List<CycleIncident> cycleIncidents = cycleIncidentRepository.findAll();
        List<AnimalIncident> animalIncidents = animalIncidentRepository.findAll();

        long totalFarmers = users.stream().filter(u -> AdminAccessPolicy.ROLE_FARMER.equals(u.getRole())).count();
        long totalManagers = users.stream().filter(u -> AdminAccessPolicy.ROLE_MANAGER.equals(u.getRole())).count();
        long totalAdmins = users.stream().filter(u -> AdminAccessPolicy.ROLE_ADMIN.equals(u.getRole())).count();
        long suspendedUsers = users.stream().filter(u -> u.getStatus() == RegistrationStatus.SUSPENDED).count();
        long pendingUsers = users.stream().filter(u -> u.getStatus() == RegistrationStatus.PENDING).count();

        double totalPlotAreaHa = plots.stream().mapToDouble(p -> p.getArea() != null ? p.getArea() : 0.0).sum();
        long totalAnimalPop = animalGroups.stream()
                .mapToLong(g -> g.getCurrentPopulation() != null ? g.getCurrentPopulation() : 0L).sum();

        long activeCycles = cycles.stream().filter(c -> c.getStatus() == CycleStatus.ACTIVE).count();
        long completedCycles = cycles.stream().filter(c -> c.getStatus() == CycleStatus.COMPLETED).count();
        double totalHarvestedKg = harvests.stream().mapToDouble(AdminManagementService::kg).sum();
        double totalInputSpend = inputs.stream().mapToDouble(i -> i.getCumulativeCost() != null ? i.getCumulativeCost() : 0.0).sum();

        List<String> incidentStatuses = new ArrayList<>();
        cycleIncidents.forEach(ci -> incidentStatuses.add(ci.getStatus()));
        animalIncidents.forEach(ai -> incidentStatuses.add(ai.getStatus()));
        long totalIncidents = incidentStatuses.size();
        long openIncidents = incidentStatuses.stream().filter(s -> "OPEN".equalsIgnoreCase(s) || "IN_PROGRESS".equalsIgnoreCase(s)).count();
        long resolvedIncidents = incidentStatuses.stream().filter(s -> "RESOLVED".equalsIgnoreCase(s) || "DISMISSED".equalsIgnoreCase(s)).count();

        List<Count> usersByRole = List.of(
                new Count("Farmers", totalFarmers),
                new Count("Managers", totalManagers),
                new Count("Admins", totalAdmins)
        );

        Map<String, Long> statusCounts = users.stream()
                .collect(Collectors.groupingBy(u -> u.getStatus() != null ? u.getStatus().name() : "APPROVED", Collectors.counting()));
        List<Count> usersByStatus = statusCounts.entrySet().stream()
                .map(e -> new Count(e.getKey(), e.getValue()))
                .toList();

        Map<String, Long> incStatusMap = incidentStatuses.stream()
                .collect(Collectors.groupingBy(s -> s != null ? s : "OPEN", Collectors.counting()));
        List<Count> incidentsByStatus = incStatusMap.entrySet().stream()
                .map(e -> new Count(e.getKey(), e.getValue()))
                .toList();

        Map<String, List<Farm>> farmsByRegMap = farms.stream()
                .collect(Collectors.groupingBy(f -> f.getRegion() != null && !f.getRegion().isBlank() ? f.getRegion() : "Unspecified"));
        List<RegionBreakdown> farmsByRegion = farmsByRegMap.entrySet().stream()
                .map(e -> new RegionBreakdown(
                        e.getKey(),
                        e.getValue().size(),
                        e.getValue().stream().mapToDouble(f -> f.getSize() != null ? f.getSize() : 0.0).sum()))
                .sorted(Comparator.comparing(RegionBreakdown::farms).reversed())
                .toList();

        Map<String, List<AnimalGroup>> groupsByType = animalGroups.stream()
                .collect(Collectors.groupingBy(g -> g.getAnimalType() != null ? g.getAnimalType().getDisplayName() : "Other"));
        List<LivestockBreakdown> livestockByType = groupsByType.entrySet().stream()
                .map(e -> new LivestockBreakdown(
                        e.getKey(),
                        e.getValue().size(),
                        e.getValue().stream().mapToLong(g -> g.getCurrentPopulation() != null ? g.getCurrentPopulation() : 0L).sum()))
                .sorted(Comparator.comparing(LivestockBreakdown::population).reversed())
                .toList();

        Map<String, List<Harvest>> harvestsByCrop = harvests.stream()
                .collect(Collectors.groupingBy(h -> h.getCycle() != null && h.getCycle().getCropName() != null
                        ? h.getCycle().getCropName() : "Other"));
        List<CropOutput> harvestByCrop = harvestsByCrop.entrySet().stream()
                .map(e -> new CropOutput(
                        e.getKey(),
                        e.getValue().stream().mapToDouble(AdminManagementService::kg).sum(),
                        e.getValue().stream().mapToDouble(AdminManagementService::bags).sum(),
                        e.getValue().size()))
                .sorted(Comparator.comparing(CropOutput::kg).reversed())
                .toList();

        Map<YearMonth, List<Harvest>> harvestsByMonth = harvests.stream()
                .filter(h -> h.getHarvestDate() != null)
                .collect(Collectors.groupingBy(h -> YearMonth.from(h.getHarvestDate())));
        List<MonthlyHarvest> harvestPerMonth = harvestsByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new MonthlyHarvest(
                        e.getKey().toString(),
                        e.getValue().stream().mapToDouble(AdminManagementService::kg).sum(),
                        e.getValue().stream().mapToDouble(AdminManagementService::bags).sum()))
                .toList();

        Map<String, List<FarmInput>> inputsByTypeMap = inputs.stream()
                .collect(Collectors.groupingBy(i -> i.getType() != null ? i.getType().name() : "OTHER"));
        List<InputSpend> inputsByType = inputsByTypeMap.entrySet().stream()
                .map(e -> new InputSpend(
                        e.getKey(),
                        e.getValue().size(),
                        e.getValue().stream().mapToDouble(i -> i.getCumulativeCost() != null ? i.getCumulativeCost() : 0.0).sum()))
                .sorted(Comparator.comparing(InputSpend::spent).reversed())
                .toList();

        return new AdminAnalyticsResponse(
                Instant.now(),
                users.size(), totalFarmers, totalManagers, totalAdmins, suspendedUsers, pendingUsers,
                farms.size(), plots.size(), totalPlotAreaHa,
                animalGroups.size(), totalAnimalPop,
                cycles.size(), activeCycles, completedCycles,
                activities.size(), harvests.size(), totalHarvestedKg, totalInputSpend,
                totalIncidents, openIncidents, resolvedIncidents,
                usersByRole, usersByStatus, incidentsByStatus,
                farmsByRegion, livestockByType, harvestByCrop, harvestPerMonth, inputsByType
        );
    }

    // ------------------------------------------------------------------ Helpers

    private void syncManagedFarms(Farmer user, List<Long> managedFarmIds) {
        if (!AdminAccessPolicy.ROLE_MANAGER.equalsIgnoreCase(user.getRole())) {
            List<Farm> current = farmRepository.findByManagerId(user.getId());
            if (!current.isEmpty()) {
                current.forEach(f -> f.setManager(null));
                farmRepository.saveAll(current);
            }
            return;
        }
        if (managedFarmIds == null) return;

        Set<Long> targetIds = new HashSet<>(managedFarmIds);
        List<Farm> currentlyManaged = farmRepository.findByManagerId(user.getId());
        List<Farm> toSave = new ArrayList<>();

        for (Farm f : currentlyManaged) {
            if (!targetIds.contains(f.getId())) {
                f.setManager(null);
                toSave.add(f);
            }
        }
        if (!targetIds.isEmpty()) {
            for (Farm f : farmRepository.findAllById(targetIds)) {
                if (f.getManager() == null || !user.getId().equals(f.getManager().getId())) {
                    f.setManager(user);
                    toSave.add(f);
                }
            }
        }
        if (!toSave.isEmpty()) {
            farmRepository.saveAll(toSave);
        }
    }

    private AdminUserRow toUserRow(Farmer u) {
        return toUserRow(u, farmRepository.findByManagerId(u.getId()));
    }

    private AdminUserRow toUserRow(Farmer u, List<Farm> managedFarms) {
        List<Long> farmIds = managedFarms.stream().map(Farm::getId).toList();
        List<String> farmNames = managedFarms.stream().map(Farm::getName).toList();
        return new AdminUserRow(
                u.getId(),
                u.getFullName(),
                u.getEmailOrPhone(),
                u.getRole(),
                u.getStatus() != null ? u.getStatus().name() : "APPROVED",
                u.getRejectionReason(),
                u.getLocation(),
                u.getFarmName(),
                u.getFarmType() != null ? u.getFarmType().name() : "MIXED",
                u.getCropsGrown(),
                u.getTotalArea(),
                u.getAvatarUrl(),
                u.getAuthProvider(),
                toInstant(u.getCreatedAt()),
                toInstant(u.getLastLoginAt()),
                farmIds,
                farmNames
        );
    }

    private ActivityRow toActivityRow(CycleActivity a) {
        Cycle c = a.getCycle();
        Farmer f = c != null ? farmerRepository.findById(c.getFarmerId()).orElse(null) : null;
        return new ActivityRow(
                a.getId(),
                a.getActivityType() != null ? a.getActivityType().name() : "OTHER",
                a.getActivityDate(),
                a.getNotes(),
                toInstant(a.getCreatedAt()),
                c != null ? c.getId() : null,
                c != null ? c.getName() : null,
                c != null ? c.getCropName() : null,
                c != null && c.getPlot() != null ? c.getPlot().getName() : null,
                c != null ? c.getFarmerId() : null,
                f != null ? f.getFullName() : "Farmer"
        );
    }

    private static String normalizeRole(String role) {
        if (role == null || role.isBlank()) return AdminAccessPolicy.ROLE_FARMER;
        String clean = role.trim().toUpperCase(Locale.ROOT);
        if (!clean.startsWith("ROLE_")) clean = "ROLE_" + clean;
        if (List.of(AdminAccessPolicy.ROLE_FARMER, AdminAccessPolicy.ROLE_MANAGER, AdminAccessPolicy.ROLE_ADMIN).contains(clean)) {
            return clean;
        }
        throw new BadRequestException("Invalid role. Allowed: ROLE_FARMER, ROLE_MANAGER, ROLE_ADMIN.");
    }

    private static FarmType parseFarmType(String value) {
        if (value == null || value.isBlank()) return FarmType.MIXED;
        try {
            return FarmType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return FarmType.MIXED;
        }
    }

    private static ActivityType parseActivityType(String value) {
        if (value == null || value.isBlank()) return ActivityType.WATERING;
        try {
            return ActivityType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return ActivityType.WATERING;
        }
    }

    private static Instant toInstant(LocalDateTime ldt) {
        return ldt != null ? ldt.atZone(ZoneId.systemDefault()).toInstant() : null;
    }

    private static double kg(Harvest h) {
        if (h.getQuantity() == null) return 0.0;
        HarvestUnit u = h.getUnit();
        if (u == HarvestUnit.TONS) return h.getQuantity() * 1000.0;
        if (u == HarvestUnit.BAGS) return h.getQuantity() * 50.0;
        return h.getQuantity();
    }

    private static double bags(Harvest h) {
        if (h.getQuantity() == null) return 0.0;
        if (h.getUnit() == HarvestUnit.BAGS) return h.getQuantity();
        return kg(h) / 50.0;
    }
}

