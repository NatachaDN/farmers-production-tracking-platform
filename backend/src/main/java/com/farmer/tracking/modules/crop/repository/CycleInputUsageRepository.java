package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleInputUsageRepository extends JpaRepository<CycleInputUsage, Long> {

    List<CycleInputUsage> findByCycleIdAndFarmerIdOrderByUsageDateDesc(Long cycleId, Long farmerId);

    Optional<CycleInputUsage> findByIdAndFarmerId(Long id, Long farmerId);

    List<CycleInputUsage> findByFarmerIdOrderByUsageDateDesc(Long farmerId);

    void deleteByIdAndFarmerId(Long id, Long farmerId);
}
