package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.HarvestCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HarvestCorrectionRepository extends JpaRepository<HarvestCorrection, Long> {
    List<HarvestCorrection> findByHarvest_IdOrderByRevisionDesc(Long harvestId);
    long countByHarvest_Id(Long harvestId);
    void deleteByHarvest_Id(Long harvestId);
}
