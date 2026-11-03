package com.farmer.tracking.modules.animal.service;

import com.farmer.tracking.modules.animal.api.AnimalGroupRequest;
import com.farmer.tracking.modules.animal.api.AnimalGroupResponse;

import java.util.List;

public interface AnimalGroupService {

    AnimalGroupResponse registerGroup(Long farmerId, AnimalGroupRequest request);

    List<AnimalGroupResponse> getGroupsByFarmer(Long farmerId);

    AnimalGroupResponse getGroupById(Long farmerId, Long groupId);

    AnimalGroupResponse updateGroup(Long farmerId, Long groupId, AnimalGroupRequest request);

    void deleteGroup(Long farmerId, Long groupId);
}
