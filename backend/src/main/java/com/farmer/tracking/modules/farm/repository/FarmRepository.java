package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    @Query("SELECT f FROM Farm f WHERE f.farmer.id = :farmerId ORDER BY f.createdAt DESC")
    List<Farm> findByFarmerIdOrderByCreatedAtDesc(@Param("farmerId") Long farmerId);

    @Query("SELECT f FROM Farm f WHERE f.id = :id AND f.farmer.id = :farmerId")
    Optional<Farm> findByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("SELECT f FROM Farm f WHERE f.farmer.id = :farmerId AND f.isDefault = true")
    Optional<Farm> findFirstByFarmerIdAndIsDefaultTrue(@Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(f) > 0 FROM Farm f WHERE f.id = :id AND f.farmer.id = :farmerId")
    boolean existsByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(f) > 0 FROM Farm f WHERE f.farmer.id = :farmerId")
    boolean existsByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT f FROM Farm f WHERE f.manager.id = :managerId ORDER BY f.createdAt DESC")
    List<Farm> findByManagerId(@Param("managerId") Long managerId);
}
