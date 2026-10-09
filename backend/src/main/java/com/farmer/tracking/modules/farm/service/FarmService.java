package com.farmer.tracking.modules.farm.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.farm.api.FarmRequest;
import com.farmer.tracking.modules.farm.api.FarmResponse;
import com.farmer.tracking.modules.farm.entity.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service managing farmer holdings / farms.
 */
@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;

    public FarmService(FarmRepository farmRepository, PlotRepository plotRepository) {
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
    }

    /**
     * Creates a new farm for a farmer. If it is their first farm or isDefault=true,
     * it becomes the default container for plots.
     */
    @Transactional
    public FarmResponse createFarm(Long farmerId, FarmRequest request) {
        boolean hasExisting = farmRepository.existsByFarmerId(farmerId);
        boolean shouldBeDefault = !hasExisting || Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault && hasExisting) {
            unsetPreviousDefault(farmerId);
        }

        Farm farm = new Farm();
        farm.setFarmerId(farmerId);
        farm.setName(request.getName().trim());
        farm.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        farm.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        farm.setCountry(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry().trim() : "Kenya");
        farm.setDistrict(request.getDistrict() != null && !request.getDistrict().isBlank() ? request.getDistrict().trim() : "Nakuru");
        farm.setIsDefault(shouldBeDefault);

        Farm saved = farmRepository.save(farm);
        return FarmResponse.fromEntity(saved, 0.0, 0);
    }

    /**
     * Retrieves all farms for a farmer. If none exist, initializes a default farm.
     */
    @Transactional
    public List<FarmResponse> getFarmsByFarmer(Long farmerId) {
        List<Farm> farms = farmRepository.findByFarmerIdOrderByCreatedAtAsc(farmerId);

        if (farms.isEmpty()) {
            Farm defaultFarm = new Farm(farmerId, "Green Acres Farm", "Nakuru County, Kenya", "Main farm", true);
            Farm saved = farmRepository.save(defaultFarm);
            farms = new ArrayList<>();
            farms.add(saved);

            // Associate any existing unassigned plots to this default farm
            List<Plot> existingPlots = plotRepository.findByFarmerId(farmerId);
            for (Plot p : existingPlots) {
                if (p.getFarm() == null) {
                    p.setFarm(saved);
                    plotRepository.save(p);
                }
            }
        }

        return farms.stream().map(farm -> {
            List<Plot> farmPlots = plotRepository.findByFarmId(farm.getId());
            double totalArea = farmPlots.stream()
                    .filter(p -> p.getArea() != null)
                    .mapToDouble(Plot::getArea)
                    .sum();
            return FarmResponse.fromEntity(farm, totalArea, farmPlots.size());
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves a farm by ID, ensuring ownership.
     */
    @Transactional(readOnly = true)
    public FarmResponse getFarmById(Long farmerId, Long farmId) {
        Farm farm = farmRepository.findByIdAndFarmerId(farmId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + farmId + " for farmer: " + farmerId));

        List<Plot> farmPlots = plotRepository.findByFarmId(farm.getId());
        double totalArea = farmPlots.stream()
                .filter(p -> p.getArea() != null)
                .mapToDouble(Plot::getArea)
                .sum();

        return FarmResponse.fromEntity(farm, totalArea, farmPlots.size());
    }

    /**
     * Updates an existing farm's information and saves the changes.
     */
    @Transactional
    public FarmResponse updateFarm(Long farmerId, Long farmId, FarmRequest request) {
        Farm farm = farmRepository.findByIdAndFarmerId(farmId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + farmId + " for farmer: " + farmerId));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(farm.getIsDefault())) {
            unsetPreviousDefault(farmerId);
            farm.setIsDefault(true);
        } else if (request.getIsDefault() != null) {
            farm.setIsDefault(request.getIsDefault());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            farm.setName(request.getName().trim());
        }
        if (request.getLocation() != null) {
            farm.setLocation(request.getLocation().trim());
        }
        if (request.getDescription() != null) {
            farm.setDescription(request.getDescription().trim());
        }
        if (request.getCountry() != null && !request.getCountry().isBlank()) {
            farm.setCountry(request.getCountry().trim());
        }
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            farm.setDistrict(request.getDistrict().trim());
        }

        Farm saved = farmRepository.save(farm);

        List<Plot> farmPlots = plotRepository.findByFarmId(saved.getId());
        double totalArea = farmPlots.stream()
                .filter(p -> p.getArea() != null)
                .mapToDouble(Plot::getArea)
                .sum();

        return FarmResponse.fromEntity(saved, totalArea, farmPlots.size());
    }

    /**
     * Sets a specific farm as the default container.
     */
    @Transactional
    public FarmResponse setDefaultFarm(Long farmerId, Long farmId) {
        Farm farm = farmRepository.findByIdAndFarmerId(farmId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + farmId + " for farmer: " + farmerId));

        unsetPreviousDefault(farmerId);
        farm.setIsDefault(true);
        Farm saved = farmRepository.save(farm);

        List<Plot> farmPlots = plotRepository.findByFarmId(saved.getId());
        double totalArea = farmPlots.stream()
                .filter(p -> p.getArea() != null)
                .mapToDouble(Plot::getArea)
                .sum();

        return FarmResponse.fromEntity(saved, totalArea, farmPlots.size());
    }

    /**
     * Deletes a farm and unlinks or reassigns associated plots.
     */
    @Transactional
    public void deleteFarm(Long farmerId, Long farmId) {
        Farm farm = farmRepository.findByIdAndFarmerId(farmId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + farmId + " for farmer: " + farmerId));

        List<Plot> plots = plotRepository.findByFarmId(farmId);
        for (Plot p : plots) {
            p.setFarm(null);
            plotRepository.save(p);
        }

        boolean wasDefault = Boolean.TRUE.equals(farm.getIsDefault());

        farmRepository.delete(farm);

        if (wasDefault) {
            List<Farm> remaining = farmRepository.findByFarmerIdOrderByCreatedAtAsc(farmerId);
            if (!remaining.isEmpty()) {
                Farm newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                farmRepository.save(newDefault);

                for (Plot p : plots) {
                    p.setFarm(newDefault);
                    plotRepository.save(p);
                }
            }
        }
    }

    private void unsetPreviousDefault(Long farmerId) {
        Optional<Farm> currentDefault = farmRepository.findFirstByFarmerIdAndIsDefaultTrue(farmerId);
        if (currentDefault.isPresent()) {
            Farm prev = currentDefault.get();
            prev.setIsDefault(false);
            farmRepository.save(prev);
        }
    }
}
