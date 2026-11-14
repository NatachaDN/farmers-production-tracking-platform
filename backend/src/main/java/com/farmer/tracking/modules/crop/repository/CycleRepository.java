package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleRepository extends JpaRepository<Cycle, Long> {
    @Override
    @EntityGraph(attributePaths = {"plot", "plot.farm"})
    List<Cycle> findAll();

    @EntityGraph(attributePaths = {"plot", "plot.farm"})
    List<Cycle> findByFarmerId(Long farmerId);
    List<Cycle> findByFarmerIdAndStatus(Long farmerId, CycleStatus status);
    @EntityGraph(attributePaths = {"plot", "plot.farm"})
    List<Cycle> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Cycle> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, CycleStatus status);
    Optional<Cycle> findByIdAndFarmerId(Long id, Long farmerId);
    Optional<Cycle> findFirstByPlotIdAndStatusOrderByIdDesc(Long plotId, CycleStatus status);
    boolean existsByPlotIdAndStatus(Long plotId, CycleStatus status);
    List<Cycle> findByPlotId(Long plotId);
}
