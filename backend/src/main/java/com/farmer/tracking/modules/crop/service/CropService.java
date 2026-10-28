package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.modules.crop.api.CropRequest;
import com.farmer.tracking.modules.crop.api.CropResponse;

import java.util.List;

public interface CropService {

    CropResponse registerCrop(Long farmerId, CropRequest request);

    List<CropResponse> getCropsByFarmer(Long farmerId);

    CropResponse getCropById(Long farmerId, Long cropId);

    CropResponse updateCrop(Long farmerId, Long cropId, CropRequest request);

    void deleteCrop(Long farmerId, Long cropId);
}
