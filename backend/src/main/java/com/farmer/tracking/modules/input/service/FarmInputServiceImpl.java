package com.farmer.tracking.modules.input.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.input.api.FarmInputRequest;
import com.farmer.tracking.modules.input.api.FarmInputResponse;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FarmInputServiceImpl implements FarmInputService {

    private final FarmInputRepository farmInputRepository;

    public FarmInputServiceImpl(FarmInputRepository farmInputRepository) {
        this.farmInputRepository = farmInputRepository;
    }

    @Override
    public FarmInputResponse registerOrUpdateInput(Long farmerId, FarmInputRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be a positive number");
        }
        if (request.getPurchasePrice() == null || request.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException("Purchase price must be a positive number");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Input name is required");
        }
        if (request.getUnit() == null || request.getUnit().trim().isEmpty()) {
            throw new IllegalArgumentException("Unit is required");
        }
        if (request.getPurchaseDate() == null) {
            throw new IllegalArgumentException("Purchase date is required");
        }

        String trimmedName = request.getName().trim();

        // Check if an input with the same name already exists for this farmer
        Optional<FarmInput> existingOpt = farmInputRepository.findByFarmerIdAndNameIgnoreCase(farmerId, trimmedName);

        FarmInput inputToSave;
        if (existingOpt.isPresent()) {
            // Update existing input (Acceptance Criterion 2: total stock and cumulative cost updated)
            inputToSave = existingOpt.get();
            inputToSave.setQuantity(inputToSave.getQuantity() + request.getQuantity());
            inputToSave.setCumulativeCost(inputToSave.getCumulativeCost() + request.getPurchasePrice());
            inputToSave.setPurchasePrice(request.getPurchasePrice());
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
}
