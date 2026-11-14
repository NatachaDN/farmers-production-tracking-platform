package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.FarmType;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.farm.dto.CreateFarmRequest;
import com.farmer.tracking.modules.farm.dto.FarmResponse;
import com.farmer.tracking.modules.farm.dto.UpdateFarmRequest;
import com.farmer.tracking.modules.farm.mapper.FarmMapper;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import com.farmer.tracking.modules.farm.model.SizeUnit;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.util.ProductionRules;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FarmerRepository farmerRepository;
    private final FarmMapper farmMapper;
    private final PlotRepository plotRepository;

    public FarmServiceImpl(FarmRepository farmRepository,
                           FarmerRepository farmerRepository,
                           FarmMapper farmMapper, PlotRepository plotRepository) {
        this.farmRepository = farmRepository;
        this.farmerRepository = farmerRepository;
        this.farmMapper = farmMapper;
        this.plotRepository = plotRepository;
    }

    @Override
    @Transactional
    public FarmResponse createFarm(Long farmerId, CreateFarmRequest request) {
        ProductionRules.positiveFinite(request.getSize(), "Farm size");
        if (request.getType() != FarmType.CROP && request.getType() != FarmType.LIVESTOCK) {
            throw new BadRequestException("Choose either a crop farm or a livestock farm.");
        }
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated farmer account not found with ID: " + farmerId));

        Farm farm = farmMapper.toEntity(request, farmer);
        // The first farm of a farmer becomes the default one (used when a plot has no farm).
        farm.setDefault(!farmRepository.existsByFarmerId(farmerId));

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
        ProductionRules.positiveFinite(request.getSize(), "Farm size");
        Farm farm = farmRepository.findLockedByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with ID: " + id));

        validateOwnership(farm, farmerId);

        if (request.getType() != farm.getType() && farm.getType() != FarmType.MIXED) {
            throw new BadRequestException("The farm type is fixed. Create a separate farm for the other operation.");
        }
        if (request.getType() != FarmType.CROP && request.getType() != FarmType.LIVESTOCK) {
            throw new BadRequestException("Choose either a crop farm or a livestock farm.");
        }
        double capacity = request.getSizeUnit() == SizeUnit.ACRES ? request.getSize() * 0.40468564224 : request.getSize();
        Double plotArea = plotRepository.totalAreaInFarm(id, null);
        if (request.getType() == FarmType.LIVESTOCK && plotArea != null && plotArea > 0) {
            throw new BadRequestException("A farm with crop plots cannot be converted to livestock.");
        }
        if (plotArea != null && plotArea > capacity + 0.000001) {
            throw new BadRequestException("Farm area cannot be smaller than its registered plots.");
        }

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
