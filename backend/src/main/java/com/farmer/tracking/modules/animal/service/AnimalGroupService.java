package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.modules.animal.dto.AnimalGroupResponse;
import com.farmer.tracking.modules.animal.dto.CreateAnimalGroupRequest;
import com.farmer.tracking.modules.animal.dto.UpdateAnimalGroupRequest;

import java.util.List;

public interface AnimalGroupService {

    /**
     * Register a new animal group for an authenticated farmer.
     */
    AnimalGroupResponse createAnimalGroup(Long farmerId, CreateAnimalGroupRequest request);

    /**
     * Retrieve all animal groups owned by the specified farmer.
     */
    List<AnimalGroupResponse> getAnimalGroupsByFarmer(Long farmerId);

    /**
     * Retrieve a specific animal group by ID, enforcing farmer data isolation.
     */
    AnimalGroupResponse getAnimalGroupById(Long id, Long farmerId);

    /**
     * Update an animal group record, enforcing farmer data isolation.
     */
    AnimalGroupResponse updateAnimalGroup(Long id, Long farmerId, UpdateAnimalGroupRequest request);

    /**
     * Delete an animal group only if no protected historical or production records depend on it.
     */
    void deleteAnimalGroup(Long id, Long farmerId);
}
