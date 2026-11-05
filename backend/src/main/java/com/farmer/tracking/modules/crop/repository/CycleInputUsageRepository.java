package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleInputUsageRepository extends JpaRepository<CycleInputUsage, Long> {

    List<CycleInputUsage> findByCycleIdAndFarmerIdOrderByUsageDateDesc(Long cycleId, Long farmerId);

    Optional<CycleInputUsage> findByIdAndFarmerId(Long id, Long farmerId);

    List<CycleInputUsage> findByFarmerIdOrderByUsageDateDesc(Long farmerId);

    void deleteByIdAndFarmerId(Long id, Long farmerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from CycleInputUsage u where u.id = :id and u.farmerId = :farmerId")
    Optional<CycleInputUsage> findLockedByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);
}
