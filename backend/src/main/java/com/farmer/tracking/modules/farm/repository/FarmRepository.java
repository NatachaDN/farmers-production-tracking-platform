package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Queries are written explicitly against {@code f.farmer.id}: Farm exposes a
 * convenience {@code getFarmerId()} getter, which makes Spring Data's derived
 * queries look for a non-existent {@code farmerId} attribute and prevents the
 * application from starting.
 */
@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Farm f where f.id = :id and f.farmer.id = :farmerId")
    Optional<Farm> findLockedByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("select f from Farm f where f.farmer.id = :farmerId order by f.createdAt desc")
    List<Farm> findByFarmerIdOrderByCreatedAtDesc(@Param("farmerId") Long farmerId);

    @Query("select f from Farm f where f.id = :id and f.farmer.id = :farmerId")
    Optional<Farm> findByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("select f from Farm f where f.farmer.id = :farmerId and f.isDefault = true order by f.id asc limit 1")
    Optional<Farm> findFirstByFarmerIdAndIsDefaultTrue(@Param("farmerId") Long farmerId);

    @Query("select count(f) > 0 from Farm f where f.id = :id and f.farmer.id = :farmerId")
    boolean existsByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("select count(f) > 0 from Farm f where f.farmer.id = :farmerId")
    boolean existsByFarmerId(@Param("farmerId") Long farmerId);
}
