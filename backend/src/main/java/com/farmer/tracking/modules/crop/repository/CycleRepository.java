package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Cycle entity operations.
 */
@Repository
public interface CycleRepository extends JpaRepository<Cycle, Long> {

    /** Find all cycles belonging to a specific farmer ordered by creation date descending. */
    List<Cycle> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    /** Find all cycles belonging to a specific farmer. */
    List<Cycle> findByFarmerId(Long farmerId);

    /** Find all cycles for a farmer filtered by status. */
    List<Cycle> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, CycleStatus status);

    /** Find all cycles for a farmer filtered by status. */
    List<Cycle> findByFarmerIdAndStatus(Long farmerId, CycleStatus status);

    /** Find a single cycle only if it belongs to the specified farmer. */
    Optional<Cycle> findByIdAndFarmerId(Long id, Long farmerId);

    /** Check if an active cycle exists on a specific plot. */
    boolean existsByPlotIdAndStatus(Long plotId, CycleStatus status);

    /** Find active cycle for a plot if present. */
    Optional<Cycle> findFirstByPlotIdAndStatusOrderByIdDesc(Long plotId, CycleStatus status);

    /** Find all cycles for a plot. */
    List<Cycle> findByPlotId(Long plotId);
}

