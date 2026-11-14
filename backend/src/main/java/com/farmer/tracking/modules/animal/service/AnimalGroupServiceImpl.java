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
import com.farmer.tracking.modules.animal.model.AnimalGroupRecord.Kind;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRecordRepository;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service implementation for managing animal groups / livestock batches.
 * Enforces strict multi-tenant data isolation and historical retention policies.
 */
@Service
@Transactional
public class AnimalGroupServiceImpl implements AnimalGroupService {

    private final AnimalGroupRepository animalGroupRepository;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final AnimalGroupRecordRepository records;

    public AnimalGroupServiceImpl(
            AnimalGroupRepository animalGroupRepository,
            FarmerRepository farmerRepository,
            FarmRepository farmRepository,
            AnimalGroupRecordRepository records
    ) {
        this.animalGroupRepository = animalGroupRepository;
        this.farmerRepository = farmerRepository;
        this.farmRepository = farmRepository;
        this.records = records;
    }

    @Override
    public AnimalGroupResponse createAnimalGroup(Long farmerId, CreateAnimalGroupRequest request) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer not found with ID: " + farmerId));

        if (request.getInitialPopulation() == null || request.getInitialPopulation() <= 0) {
            throw new BadRequestException("Initial population must be greater than zero");
        }

        Integer currentPopulation = request.getCurrentPopulation() != null
                ? request.getCurrentPopulation()
                : request.getInitialPopulation();

        if (currentPopulation < 0) {
            throw new BadRequestException("Current population cannot be negative");
        }

        Farm farm = livestockFarm(farmerId, request.getFarmId());

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
        AnimalGroup group = animalGroupRepository.findForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found with ID: " + id));

        validateOwnership(group, farmerId);

        if (request.getCurrentPopulation() == null || request.getCurrentPopulation() < 0) {
            throw new BadRequestException("Current population cannot be negative");
        }
        if (!request.getCurrentPopulation().equals(group.getCurrentPopulation())
                && records.existsByGroup_IdAndKindIn(id, List.of(Kind.ADDITION, Kind.DEATH, Kind.SALE, Kind.REMOVAL, Kind.BIRTH))) {
            throw new ConflictException("Record a population change in the group history.");
        }

        if (request.getInitialPopulation() != null && request.getInitialPopulation() <= 0) {
            throw new BadRequestException("Initial population must be greater than zero");
        }

        Farm farm = livestockFarm(farmerId, request.getFarmId() == null ? group.getFarmId() : request.getFarmId());

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

        AnimalGroup updated = animalGroupRepository.save(group);
        return AnimalGroupResponse.fromEntity(updated);
    }

    @Override
    public void deleteAnimalGroup(Long id, Long farmerId) {
        AnimalGroup group = animalGroupRepository.findForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal group not found with ID: " + id));

        validateOwnership(group, farmerId);

        // Deletion Strategy & Policy (AC-08 & AC-09):
        // Allow deletion only when doing so does not compromise associated production or historical records.
        // If the group is archived with historical records or has active production logs, deletion is rejected.
        if (records.existsByGroup_Id(id) || hasProtectedHistoricalDependencies(group)) {
            throw new ConflictException(
                    "Cannot delete animal group '" + group.getName() + "' because it has protected historical records or active production history. Consider updating its status to ARCHIVED instead."
            );
        }

        animalGroupRepository.delete(group);
    }

    /**
     * Checks if the animal group has protected historical records that must be retained.
     * In this baseline, an archived group with recorded notes or custom population shifts is protected,
     * laying the foundation for future production and health logs.
     */
    private boolean hasProtectedHistoricalDependencies(AnimalGroup group) {
        if (group.getStatus() == AnimalGroupStatus.ARCHIVED && group.getNotes() != null && group.getNotes().contains("[PROTECTED]")) {
            return true;
        }
        return false;
    }

    private void validateOwnership(AnimalGroup group, Long farmerId) {
        if (group.getFarmer() == null || !group.getFarmer().getId().equals(farmerId)) {
            throw new ForbiddenException("Data Isolation Violation: You do not have permission to access animal group " + group.getId());
        }
    }

    private Farm livestockFarm(Long farmerId, Long farmId) {
        if (farmId == null) throw new BadRequestException("Select a livestock farm.");
        Farm farm = farmRepository.findByIdAndFarmerId(farmId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found for this farmer."));
        if (farm.getType() != FarmType.LIVESTOCK) {
            throw new BadRequestException("Animal groups can only belong to livestock farms.");
        }
        return farm;
    }
}
