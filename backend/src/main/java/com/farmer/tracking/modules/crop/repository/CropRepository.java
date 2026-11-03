package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {

    List<Crop> findByFarmerIdOrderByNameAsc(Long farmerId);

    Optional<Crop> findByIdAndFarmerId(Long id, Long farmerId);

    boolean existsByFarmerIdAndNameIgnoreCase(Long farmerId, String name);

    boolean existsByFarmerIdAndNameIgnoreCaseAndVarietyIgnoreCase(Long farmerId, String name, String variety);

    void deleteByIdAndFarmerId(Long id, Long farmerId);
}
