package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.ActivityType;
import com.farmer.tracking.modules.crop.entity.CycleActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Database access for {@link CycleActivity} entities.
 */
@Repository
public interface CycleActivityRepository extends JpaRepository<CycleActivity, Long> {

    /** All activities for a cycle, most recent first. */
    List<CycleActivity> findByCycleIdOrderByActivityDateDesc(Long cycleId);

    /** Find a specific activity within a specific cycle. */
    Optional<CycleActivity> findByIdAndCycleId(Long id, Long cycleId);

    /** All activities of a given type for a cycle. */
    List<CycleActivity> findByCycleIdAndActivityType(Long cycleId, ActivityType activityType);
}
