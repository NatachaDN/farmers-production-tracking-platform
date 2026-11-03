package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.modules.crop.api.CycleCostSummaryResponse;
import com.farmer.tracking.modules.crop.api.CycleInputUsageRequest;
import com.farmer.tracking.modules.crop.api.CycleInputUsageResponse;

import java.util.List;

public interface CycleInputUsageService {

    CycleInputUsageResponse recordInputUsage(Long farmerId, Long cycleId, CycleInputUsageRequest request);

    List<CycleInputUsageResponse> getInputsByCycle(Long farmerId, Long cycleId);

    CycleCostSummaryResponse getCycleCostSummary(Long farmerId, Long cycleId);

    void deleteInputUsage(Long farmerId, Long cycleId, Long usageId);
}
