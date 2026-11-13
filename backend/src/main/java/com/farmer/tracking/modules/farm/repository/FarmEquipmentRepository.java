package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.FarmEquipment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmEquipmentRepository extends JpaRepository<FarmEquipment, Long> {
    List<FarmEquipment> findByFarmerIdOrderByNameAscIdAsc(Long farmerId);
    Optional<FarmEquipment> findByIdAndFarmerId(Long id, Long farmerId);
}
