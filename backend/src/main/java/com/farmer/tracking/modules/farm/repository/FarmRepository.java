package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Farm entity operations.
 */
@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    /** Find all farms belonging to a farmer, ordered by creation date ascending. */
    List<Farm> findByFarmerIdOrderByCreatedAtAsc(Long farmerId);

    /** Find a farm by ID only if owned by the specified farmer. */
    Optional<Farm> findByIdAndFarmerId(Long id, Long farmerId);

    /** Find the default farm container for a farmer. */
    Optional<Farm> findFirstByFarmerIdAndIsDefaultTrue(Long farmerId);

    /** Check if a farmer has any farms registered. */
    boolean existsByFarmerId(Long farmerId);
}
