package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.FarmerAccessGuard;
import com.farmer.tracking.modules.animal.api.AnimalGroupRequest;
import com.farmer.tracking.modules.animal.api.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.entity.AnimalGroup;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing animal groups (livestock).
 */
@Service
@Transactional
public class AnimalGroupServiceImpl implements AnimalGroupService {

    private final AnimalGroupRepository animalGroupRepository;

    public AnimalGroupServiceImpl(AnimalGroupRepository animalGroupRepository) {
        this.animalGroupRepository = animalGroupRepository;
    }

    @Override
    public AnimalGroupResponse registerGroup(Long farmerId, AnimalGroupRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "animal group");

        if (request.getType() == null) {
            throw new IllegalArgumentException("Animal type is required");
        }
        if (request.getPurpose() == null) {
            throw new IllegalArgumentException("Production purpose is required");
        }
        if (request.getNumberOfAnimals() == null || request.getNumberOfAnimals() <= 0) {
            throw new IllegalArgumentException("Number of animals must be a positive number");
        }
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }

        AnimalGroup group = new AnimalGroup(
                farmerId,
                request.getType(),
                request.getPurpose(),
                request.getNumberOfAnimals(),
                request.getStartDate(),
                request.getNotes()
        );

        AnimalGroup saved = animalGroupRepository.save(group);
        return AnimalGroupResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalGroupResponse> getGroupsByFarmer(Long farmerId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "animal group");
        return animalGroupRepository.findByFarmerIdOrderByStartDateDesc(farmerId).stream()
                .map(AnimalGroupResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalGroupResponse getGroupById(Long farmerId, Long groupId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "animal group");
        AnimalGroup group = animalGroupRepository.findByIdAndFarmerId(groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Animal group not found with id: " + groupId + " for farmer: " + farmerId));
        return AnimalGroupResponse.fromEntity(group);
    }

    @Override
    public AnimalGroupResponse updateGroup(Long farmerId, Long groupId, AnimalGroupRequest request) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "animal group");

        AnimalGroup group = animalGroupRepository.findByIdAndFarmerId(groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Animal group not found with id: " + groupId + " for farmer: " + farmerId));

        if (request.getType() != null) {
            group.setType(request.getType());
        }
        if (request.getPurpose() != null) {
            group.setPurpose(request.getPurpose());
        }
        if (request.getNumberOfAnimals() != null) {
            if (request.getNumberOfAnimals() <= 0) {
                throw new IllegalArgumentException("Number of animals must be a positive number");
            }
            group.setNumberOfAnimals(request.getNumberOfAnimals());
        }
        if (request.getStartDate() != null) {
            group.setStartDate(request.getStartDate());
        }
        if (request.getNotes() != null) {
            group.setNotes(request.getNotes());
        }

        AnimalGroup saved = animalGroupRepository.save(group);
        return AnimalGroupResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteGroup(Long farmerId, Long groupId) {
        FarmerAccessGuard.validateFarmerAccess(farmerId, "animal group");
        AnimalGroup group = animalGroupRepository.findByIdAndFarmerId(groupId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Animal group not found with id: " + groupId + " for farmer: " + farmerId));
        animalGroupRepository.delete(group);
    }
}
