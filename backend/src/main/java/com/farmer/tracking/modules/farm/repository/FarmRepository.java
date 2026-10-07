package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    Optional<Farm> findByIdAndFarmerId(Long id, Long farmerId);

    boolean existsByIdAndFarmerId(Long id, Long farmerId);
}
