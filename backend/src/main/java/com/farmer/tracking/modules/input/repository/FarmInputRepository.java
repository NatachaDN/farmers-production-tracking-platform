package com.farmer.tracking.modules.input.repository;

import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmInputRepository extends JpaRepository<FarmInput, Long> {

    List<FarmInput> findByFarmerId(Long farmerId);

    List<FarmInput> findByFarmerIdAndType(Long farmerId, InputType type);

    Optional<FarmInput> findByIdAndFarmerId(Long id, Long farmerId);

    Optional<FarmInput> findByFarmerIdAndNameIgnoreCase(Long farmerId, String name);
}
