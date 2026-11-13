package com.farmer.tracking.modules.input.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FarmInputServiceImpl implements FarmInputService {

    private final FarmInputRepository farmInputRepository;
    private final FarmerRepository farmerRepository;

    public FarmInputServiceImpl(FarmInputRepository farmInputRepository, FarmerRepository farmerRepository) {
        this.farmInputRepository = farmInputRepository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    public FarmInputResponse registerOrUpdateInput(Long farmerId, FarmInputRequest request) {
        if (request.getQuantity() == null || !Double.isFinite(request.getQuantity()) || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be a positive number");
        }
        if (request.getPurchasePrice() == null || !Double.isFinite(request.getPurchasePrice()) || request.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException("Purchase price must be a positive number");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Input name is required");
        }
        if (request.getUnit() == null || request.getUnit().trim().isEmpty()) {
            throw new IllegalArgumentException("Unit is required");
        }
        if (request.getPurchaseDate() == null || request.getPurchaseDate().isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Purchase date is required and cannot be in the future");
        }

        String trimmedName = request.getName().trim();

        // Also serializes the first purchase of a same-name input: there may be no stock row to lock yet.
        farmerRepository.findLockedById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", farmerId));

        // Check if an input with the same name already exists for this farmer
        Optional<FarmInput> existingOpt = farmInputRepository.findLockedByFarmerIdAndName(farmerId, trimmedName);

        FarmInput inputToSave;
        if (existingOpt.isPresent()) {
            // Update existing input (Acceptance Criterion 2: total stock and cumulative cost updated)
            inputToSave = existingOpt.get();
            if (!inputToSave.getUnit().equalsIgnoreCase(request.getUnit().trim())) {
                throw new BadRequestException("Restock unit must match the existing stock unit (" + inputToSave.getUnit() + "). Register a separate input for a different unit.");
            }
            if (request.getType() != inputToSave.getType()) {
                throw new BadRequestException("Restock type must match the existing input type.");
            }
            inputToSave.addStock(request.getQuantity(), request.getPurchasePrice());
            inputToSave.setPurchaseDate(request.getPurchaseDate());
            inputToSave.setUnit(request.getUnit().trim());
            if (request.getType() != null) {
                inputToSave.setType(request.getType());
            }
        } else {
            // Create new input (Acceptance Criterion 1)
            inputToSave = new FarmInput(
                    farmerId,
                    trimmedName,
                    request.getType(),
                    request.getQuantity(),
                    request.getUnit().trim(),
                    request.getPurchaseDate(),
                    request.getPurchasePrice(),
                    request.getPurchasePrice() // Initial cumulative cost = first purchase price
            );
        }

        FarmInput saved = farmInputRepository.save(inputToSave);
        return FarmInputResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmInputResponse> getInputsByFarmer(Long farmerId) {
        return farmInputRepository.findByFarmerId(farmerId).stream()
                .map(FarmInputResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmInputResponse> getInputsByFarmerAndType(Long farmerId, InputType type) {
        return farmInputRepository.findByFarmerIdAndType(farmerId, type).stream()
                .map(FarmInputResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FarmInputResponse getInputById(Long farmerId, Long inputId) {
        FarmInput input = farmInputRepository.findByIdAndFarmerId(inputId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input", inputId));
        return FarmInputResponse.fromEntity(input);
    }

    @Override
    public void deleteInput(Long farmerId, Long inputId) {
        FarmInput input = farmInputRepository.findLockedByIdAndFarmerId(inputId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input", inputId));
        farmInputRepository.delete(input);
    }

    @Override
    public FarmInputResponse confirmUnitCost(Long farmerId, Long inputId, Double unitCost) {
        if (unitCost == null || !Double.isFinite(unitCost) || unitCost < 0) {
            throw new BadRequestException("Unit cost must be a finite, non-negative amount.");
        }
        FarmInput input = farmInputRepository.findLockedByIdAndFarmerId(inputId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm input", inputId));
        if (input.getUnitCost() != null) {
            throw new ConflictException("This input already has a confirmed unit cost.");
        }
        input.setUnitCost(unitCost);
        return FarmInputResponse.fromEntity(farmInputRepository.save(input));
    }
}
