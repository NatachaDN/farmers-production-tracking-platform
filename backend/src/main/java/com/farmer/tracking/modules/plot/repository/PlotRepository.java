package com.farmer.tracking.modules.plot.repository;

import com.farmer.tracking.modules.plot.entity.Plot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Plot p where p.id = :id and p.farmerId = :farmerId")
    Optional<Plot> findLockedByIdAndFarmerId(@org.springframework.data.repository.query.Param("id") Long id,
                                           @org.springframework.data.repository.query.Param("farmerId") Long farmerId);

    @org.springframework.data.jpa.repository.Query("select coalesce(sum(p.area), 0) from Plot p where p.farm.id = :farmId and (:excludeId is null or p.id <> :excludeId)")
    Double totalAreaInFarm(@org.springframework.data.repository.query.Param("farmId") Long farmId,
                          @org.springframework.data.repository.query.Param("excludeId") Long excludeId);

    List<Plot> findByFarmerId(Long farmerId);

    Optional<Plot> findByIdAndFarmerId(Long id, Long farmerId);

    List<Plot> findByFarmId(Long farmId);
}
