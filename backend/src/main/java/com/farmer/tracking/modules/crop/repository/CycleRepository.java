package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.Cycle;
import com.farmer.tracking.modules.crop.entity.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleRepository extends JpaRepository<Cycle, Long> {
    List<Cycle> findByFarmerId(Long farmerId);
    List<Cycle> findByFarmerIdIn(java.util.Collection<Long> ids);
    List<Cycle> findByFarmerIdAndStatus(Long farmerId, CycleStatus status);
    List<Cycle> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Cycle> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, CycleStatus status);
    Optional<Cycle> findByIdAndFarmerId(Long id, Long farmerId);
    Optional<Cycle> findFirstByPlotIdAndStatusOrderByIdDesc(Long plotId, CycleStatus status);
    boolean existsByPlotIdAndStatus(Long plotId, CycleStatus status);
    List<Cycle> findByPlotId(Long plotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cycle c where c.id = :id and c.farmerId = :farmerId")
    Optional<Cycle> findLockedByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("select case when exists (select h.id from Harvest h where h.cycle.id = :id) "
            + "or exists (select a.id from CycleActivity a where a.cycle.id = :id) "
            + "or exists (select i.id from CycleIncident i where i.cycle.id = :id) "
            + "or exists (select u.id from CycleInputUsage u where u.cycle.id = :id) "
            + "then true else false end from Cycle c where c.id = :id")
    boolean hasRecordedHistory(@Param("id") Long id);
}
