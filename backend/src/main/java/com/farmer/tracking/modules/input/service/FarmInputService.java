package com.farmer.tracking.modules.input.service;

import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.InputType;

import java.util.List;

public interface FarmInputService {

    FarmInputResponse registerOrUpdateInput(Long farmerId, FarmInputRequest request);

    List<FarmInputResponse> getInputsByFarmer(Long farmerId);

    List<FarmInputResponse> getInputsByFarmerAndType(Long farmerId, InputType type);

    FarmInputResponse getInputById(Long farmerId, Long inputId);
}
