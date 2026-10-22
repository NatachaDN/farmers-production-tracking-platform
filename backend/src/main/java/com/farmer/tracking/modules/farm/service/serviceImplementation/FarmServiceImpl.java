package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.mapper.FarmMapper;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FarmerRepository farmerRepository;
    private final FarmMapper farmMapper;

    public FarmServiceImpl(FarmRepository farmRepository,
                           FarmerRepository farmerRepository,
                           FarmMapper farmMapper) {
        this.farmRepository = farmRepository;
        this.farmerRepository = farmerRepository;
        this.farmMapper = farmMapper;
    }

    @Override
    @Transactional
    public FarmResponse createFarm(Long farmerId, CreateFarmRequest request) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer account not found with ID: " + farmerId));

        Farm farm = farmMapper.toEntity(request, farmer);
        Farm savedFarm = farmRepository.save(farm);
        return farmMapper.toResponse(savedFarm);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmResponse> getFarmsByFarmer(Long farmerId) {
        return farmRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
                .stream()
                .map(farmMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FarmResponse getFarmById(Long id, Long farmerId) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with ID: " + id));

        validateOwnership(farm, farmerId);

        return farmMapper.toResponse(farm);
    }

    @Override
    @Transactional
    public FarmResponse updateFarm(Long id, Long farmerId, UpdateFarmRequest request) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with ID: " + id));

        validateOwnership(farm, farmerId);

        farmMapper.updateEntityFromDto(request, farm);
        Farm updatedFarm = farmRepository.save(farm);
        return farmMapper.toResponse(updatedFarm);
    }

    private void validateOwnership(Farm farm, Long farmerId) {
        if (farm.getFarmer() == null || !farm.getFarmer().getId().equals(farmerId)) {
            throw new ForbiddenException("Data Isolation Violation: You do not have permission to access farm " + farm.getId());
        }
    }
}
