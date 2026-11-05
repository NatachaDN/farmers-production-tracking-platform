package com.farmer.tracking.modules.input.repository;

import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmInputRepository extends JpaRepository<FarmInput, Long> {

    List<FarmInput> findByFarmerId(Long farmerId);

    List<FarmInput> findByFarmerIdAndType(Long farmerId, InputType type);

    Optional<FarmInput> findByIdAndFarmerId(Long id, Long farmerId);

    Optional<FarmInput> findByFarmerIdAndNameIgnoreCase(Long farmerId, String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from FarmInput i where i.id = :id and i.farmerId = :farmerId")
    Optional<FarmInput> findLockedByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from FarmInput i where i.farmerId = :farmerId and lower(i.name) = lower(:name)")
    Optional<FarmInput> findLockedByFarmerIdAndName(@Param("farmerId") Long farmerId, @Param("name") String name);
}
