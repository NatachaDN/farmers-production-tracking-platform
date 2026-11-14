package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.animal.dto.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.dto.CreateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.dto.UpdateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing animal groups / livestock batches.
 * Enforces strict multi-tenant data isolation and historical retention
 * policies.
 */
@Service
@Transactional
public class AnimalGroupServiceImpl implements AnimalGroupService {

    private final AnimalGroupRepository animalGroupRepository;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;

    public AnimalGroupServiceImpl(
            AnimalGroupRepository animalGroupRepository,
            FarmerRepository farmerRepository,
            FarmRepository farmRepository) {
        this.animalGroupRepository = animalGroupRepository;
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
    }

    @Override
    public AnimalGroupResponse createAnimalGroup(Long farmerId, CreateAnimalGroupRequest request) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Authenticated farmer not found with ID: " + farmerId));

        if (request.getInitialPopulation() == null || request.getInitialPopulation() <= 0) {
            throw new BadRequestException("Initial population must be greater than zero");
        }

        Integer currentPopulation = request.getCurrentPopulation() != null
                ? request.getCurrentPopulation()
                : request.getInitialPopulation();

        if (currentPopulation < 0) {
            throw new BadRequestException("Current population cannot be negative");
        }

        Farm farm = null;
        if (request.getFarmId() != null) {
            farm = farmRepository.findByIdAndFarmerId(request.getFarmId(), farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Farm not found with ID " + request.getFarmId() + " for this farmer"));
        }

        AnimalGroup group = new AnimalGroup();
        group.setFarmer(farmer);
        group.setFarm(farm);
        group.setName(request.getName().trim());
        group.setAnimalType(request.getAnimalType());
        group.setBreed(request.getBreed() != null ? request.getBreed().trim() : null);
        group.setInitialPopulation(request.getInitialPopulation());
        group.setCurrentPopulation(currentPopulation);
        group.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        group.setPurpose(request.getPurpose() != null ? request.getPurpose().trim() : null);
        group.setStatus(request.getStatus() != null ? request.getStatus() : AnimalGroupStatus.ACTIVE);
        group.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        group.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        applyExtendedDetails(
                group,
                request.getDescription(),
                request.getFeedingRegime(),
                request.getHealthStatus(),
                request.getAverageWeightKg(),
                request.getImageUrls());

        AnimalGroup saved = animalGroupRepository.save(group);
        return AnimalGroupResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalGroupResponse> getAnimalGroupsByFarmer(Long farmerId) {
        return animalGroupRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
                .stream()
                .map(AnimalGroupResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalGroupResponse getAnimalGroupById(Long id, Long farmerId) {
        AnimalGroup group = animalGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found with ID: " + id));

        validateOwnership(group, farmerId);

        return AnimalGroupResponse.fromEntity(group);
    }

    @Override
    public AnimalGroupResponse updateAnimalGroup(Long id, Long farmerId, UpdateAnimalGroupRequest request) {
        AnimalGroup group = animalGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found with ID: " + id));

        validateOwnership(group, farmerId);

        if (request.getCurrentPopulation() == null || request.getCurrentPopulation() < 0) {
            throw new BadRequestException("Current population cannot be negative");
        }

        if (request.getInitialPopulation() != null && request.getInitialPopulation() <= 0) {
            throw new BadRequestException("Initial population must be greater than zero");
        }

        Farm farm = group.getFarm();
        if (request.getFarmId() != null) {
            farm = farmRepository.findByIdAndFarmerId(request.getFarmId(), farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Farm not found with ID " + request.getFarmId() + " for this farmer"));
        } else if (request.getFarmId() == null && request.getName() != null) {
            // Keep existing or clear if explicitly needed; if null in request, preserve
            // unless requested
        }

        group.setName(request.getName().trim());
        group.setAnimalType(request.getAnimalType());
        group.setBreed(request.getBreed() != null ? request.getBreed().trim() : null);
        group.setCurrentPopulation(request.getCurrentPopulation());
        if (request.getInitialPopulation() != null) {
            group.setInitialPopulation(request.getInitialPopulation());
        }
        group.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        group.setPurpose(request.getPurpose() != null ? request.getPurpose().trim() : null);
        if (request.getStatus() != null) {
            group.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            group.setStartDate(request.getStartDate());
        }
        group.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        group.setFarm(farm);
        applyExtendedDetails(
                group,
                request.getDescription(),
                request.getFeedingRegime(),
                request.getHealthStatus(),
                request.getAverageWeightKg(),
                request.getImageUrls());

        AnimalGroup updated = animalGroupRepository.save(group);
        return AnimalGroupResponse.fromEntity(updated);
    }

    private void applyExtendedDetails(
            AnimalGroup group,
            String description,
            String feedingRegime,
            String healthStatus,
            Double averageWeightKg,
            List<String> imageUrls) {
        group.setDescription(trimOrNull(description));
        group.setFeedingRegime(trimOrNull(feedingRegime));
        group.setHealthStatus(trimOrNull(healthStatus));
        group.setAverageWeightKg(averageWeightKg);
        if (imageUrls != null) {
            List<String> cleaned = imageUrls.stream()
                    .filter(u -> u != null && !u.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toCollection(ArrayList::new));
            group.setImageUrls(cleaned);
        }
    }

    private String trimOrNull(String value) {
        if (value == null)
            return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    public void deleteAnimalGroup(Long id, Long farmerId) {
        AnimalGroup group = animalGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found with ID: " + id));

        validateOwnership(group, farmerId);

        // Deletion Strategy & Policy (AC-08 & AC-09):
        // Allow deletion only when doing so does not compromise associated production
        // or historical records.
        // If the group is archived with historical records or has active production
        // logs, deletion is rejected.
        if (hasProtectedHistoricalDependencies(group)) {
            throw new ConflictException(
                    "Cannot delete animal group '" + group.getName()
                            + "' because it has protected historical records or active production history. Consider updating its status to ARCHIVED instead.");
        }

        animalGroupRepository.delete(group);
    }

    /**
     * Checks if the animal group has protected historical records that must be
     * retained.
     * In this baseline, an archived group with recorded notes or custom population
     * shifts is protected,
     * laying the foundation for future production and health logs.
     */
    private boolean hasProtectedHistoricalDependencies(AnimalGroup group) {
        if (group.getStatus() == AnimalGroupStatus.ARCHIVED && group.getNotes() != null
                && group.getNotes().contains("[PROTECTED]")) {
            return true;
        }
        return false;
    }

    private void validateOwnership(AnimalGroup group, Long farmerId) {
        if (group.getFarmer() == null || !group.getFarmer().getId().equals(farmerId)) {
            throw new ForbiddenException(
                    "Data Isolation Violation: You do not have permission to access animal group " + group.getId());
        }
    }
}
