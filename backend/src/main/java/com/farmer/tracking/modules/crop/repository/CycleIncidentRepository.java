package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.CycleIncident;
import com.farmer.tracking.modules.crop.entity.IncidentType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Database access for {@link CycleIncident} entities.
 */
@Repository
public interface CycleIncidentRepository extends JpaRepository<CycleIncident, Long> {

    @Override
    @EntityGraph(attributePaths = {"cycle", "cycle.plot"})
    List<CycleIncident> findAll();

    /** All incidents for a cycle, most recent first. */
    List<CycleIncident> findByCycleIdOrderByIncidentDateDesc(Long cycleId);

    /** Batch fetch incidents for multiple cycles, most recent first. */
    @EntityGraph(attributePaths = {"cycle", "cycle.plot"})
    List<CycleIncident> findByCycleIdInOrderByIncidentDateDesc(Collection<Long> cycleIds);

    /** Find a specific incident within a specific cycle (ownership check). */
    Optional<CycleIncident> findByIdAndCycleId(Long id, Long cycleId);

    /** All incidents of a given type for a cycle. */
    List<CycleIncident> findByCycleIdAndIncidentType(Long cycleId, IncidentType incidentType);

    /** Count incidents per farmer for metrics. */
    long countByFarmerId(Long farmerId);
}
