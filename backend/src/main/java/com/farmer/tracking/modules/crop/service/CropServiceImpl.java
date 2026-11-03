package com.farmer.tracking.modules.crop.service;

import com.farmer.tracking.common.exception.ConflictException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.exception.UnauthorizedException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.crop.api.CropRequest;
import com.farmer.tracking.modules.crop.api.CropResponse;
import com.farmer.tracking.modules.crop.entity.Crop;
import com.farmer.tracking.modules.crop.repository.CropRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CropServiceImpl implements CropService {

    private final CropRepository cropRepository;

    public CropServiceImpl(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    @Override
    public CropResponse registerCrop(Long farmerId, CropRequest request) {
        validateFarmerAccess(farmerId);

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Crop name is required");
        }

        String trimmedName = request.getName().trim();
        String trimmedVariety = (request.getVariety() != null && !request.getVariety().trim().isEmpty())
                ? request.getVariety().trim()
                : null;

        // Check for duplicate crop (same name and variety) for this farmer
        boolean exists = (trimmedVariety != null)
                ? cropRepository.existsByFarmerIdAndNameIgnoreCaseAndVarietyIgnoreCase(farmerId, trimmedName, trimmedVariety)
                : cropRepository.existsByFarmerIdAndNameIgnoreCase(farmerId, trimmedName);

        if (exists) {
            String duplicateDesc = trimmedVariety != null
                    ? "'" + trimmedName + "' (" + trimmedVariety + ")"
                    : "'" + trimmedName + "'";
            throw new ConflictException("Crop " + duplicateDesc + " is already in your personal crops list.");
        }

        Crop crop = new Crop(farmerId, trimmedName, trimmedVariety);
        Crop saved = cropRepository.save(crop);
        return CropResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CropResponse> getCropsByFarmer(Long farmerId) {
        validateFarmerAccess(farmerId);
        return cropRepository.findByFarmerIdOrderByNameAsc(farmerId)
                .stream()
                .map(CropResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CropResponse getCropById(Long farmerId, Long cropId) {
        validateFarmerAccess(farmerId);
        Crop crop = cropRepository.findByIdAndFarmerId(cropId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId + " for farmer: " + farmerId));
        return CropResponse.fromEntity(crop);
    }

    @Override
    public CropResponse updateCrop(Long farmerId, Long cropId, CropRequest request) {
        validateFarmerAccess(farmerId);

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Crop name is required");
        }

        Crop crop = cropRepository.findByIdAndFarmerId(cropId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId + " for farmer: " + farmerId));

        String trimmedName = request.getName().trim();
        String trimmedVariety = (request.getVariety() != null && !request.getVariety().trim().isEmpty())
                ? request.getVariety().trim()
                : null;

        crop.setName(trimmedName);
        crop.setVariety(trimmedVariety);

        Crop saved = cropRepository.save(crop);
        return CropResponse.fromEntity(saved);
    }

    @Override
    public void deleteCrop(Long farmerId, Long cropId) {
        validateFarmerAccess(farmerId);
        Crop crop = cropRepository.findByIdAndFarmerId(cropId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId + " for farmer: " + farmerId));
        cropRepository.delete(crop);
    }

    /**
     * Validates that if a user is authenticated, they can only access their own data,
     * unless they hold the ROLE_ADMIN role.
     */
    private void validateFarmerAccess(Long farmerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin && !principal.getId().equals(farmerId)) {
                throw new UnauthorizedException("Access denied: You can only access your own crop records.");
            }
        }
    }
}
