package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;

import java.util.List;

public interface FarmService {

    FarmResponse createFarm(Long farmerId, CreateFarmRequest request);

    List<FarmResponse> getFarmsByFarmer(Long farmerId);

    FarmResponse getFarmById(Long id, Long farmerId);

    FarmResponse updateFarm(Long id, Long farmerId, UpdateFarmRequest request);
}
