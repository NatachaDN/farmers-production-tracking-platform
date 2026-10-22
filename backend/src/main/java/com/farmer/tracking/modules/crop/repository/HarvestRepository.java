package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Harvest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Harvest entity operations.
 */
@Repository
public interface HarvestRepository extends JpaRepository<Harvest, Long> {

    Optional<Harvest> findByCycleId(Long cycleId);

    boolean existsByCycleId(Long cycleId);
}
