package com.farmer.tracking.modules.manager.service;

import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.security.AdminAccessPolicy;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.repository.AnimalGroupRepository;
import com.farmer.tracking.modules.farm.model.Farm;
import com.farmer.tracking.modules.farm.repository.FarmRepository;
import com.farmer.tracking.modules.plot.entity.Plot;
import com.farmer.tracking.modules.plot.repository.PlotRepository;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ManagerScopeHelper {

    public record ManagerScope(boolean restricted, Long managerId, Set<Long> farmIds, Set<Long> farmerIds) {
        public static ManagerScope unrestricted() {
            return new ManagerScope(false, null, Set.of(), Set.of());
        }

        public boolean allowsFarm(Long farmId) {
            return !restricted || (farmId != null && farmIds.contains(farmId));
        }

        public boolean allowsFarmer(Long farmerId) {
            return !restricted || (farmerId != null && farmerIds.contains(farmerId));
        }
    }

    private final FarmRepository farmRepository;
    private final PlotRepository plotRepository;
    private final AnimalGroupRepository animalGroupRepository;

    public ManagerScopeHelper(
            FarmRepository farmRepository,
            PlotRepository plotRepository,
            AnimalGroupRepository animalGroupRepository) {
        this.farmRepository = farmRepository;
        this.plotRepository = plotRepository;
        this.animalGroupRepository = animalGroupRepository;
    }

    public ManagerScope resolve(UserPrincipal principal) {
        if (principal == null) {
            return ManagerScope.unrestricted();
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> AdminAccessPolicy.ROLE_ADMIN.equalsIgnoreCase(a.getAuthority()));
        if (isAdmin) {
            return ManagerScope.unrestricted();
        }

        Long managerId = principal.getId();
        List<Object[]> assignedRows = farmRepository.findScopeIdsByManagerId(managerId);
        Set<Long> farmIds = new HashSet<>();
        Set<Long> farmerIds = new HashSet<>();

        for (Object[] row : assignedRows) {
            if (row[0] instanceof Long farmId) {
                farmIds.add(farmId);
            }
            if (row[1] instanceof Long farmerId) {
                farmerIds.add(farmerId);
            }
        }
        if (!farmIds.isEmpty()) {
            farmerIds.addAll(plotRepository.findDistinctFarmerIdsByFarmIdIn(farmIds));
            farmerIds.addAll(animalGroupRepository.findDistinctFarmerIdsByFarmIdIn(farmIds));
        }

        return new ManagerScope(true, managerId, farmIds, farmerIds);
    }

    public void requireFarmAccess(ManagerScope scope, Long farmId) {
        if (scope.restricted() && !scope.allowsFarm(farmId)) {
            throw new BadRequestException("Access denied: you can only manage farms assigned to you.");
        }
    }

    public void requireFarmerAccess(ManagerScope scope, Long farmerId) {
        if (scope.restricted() && !scope.allowsFarmer(farmerId)) {
            throw new BadRequestException("Access denied: this farmer does not belong to any of your assigned farms.");
        }
    }
}

