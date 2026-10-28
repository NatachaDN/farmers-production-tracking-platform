package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleRepository extends JpaRepository<Cycle, Long> {
    List<Cycle> findByFarmerId(Long farmerId);
    List<Cycle> findByFarmerIdAndStatus(Long farmerId, CycleStatus status);
    List<Cycle> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Cycle> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, CycleStatus status);
    Optional<Cycle> findByIdAndFarmerId(Long id, Long farmerId);
    Optional<Cycle> findFirstByPlotIdAndStatusOrderByIdDesc(Long plotId, CycleStatus status);
}