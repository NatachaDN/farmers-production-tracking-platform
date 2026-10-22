package com.farmer.tracking.modules.plot.repository;

import com.farmer.tracking.modules.plot.entity.Plot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Long> {

    List<Plot> findByFarmerId(Long farmerId);

    Optional<Plot> findByIdAndFarmerId(Long id, Long farmerId);

    List<Plot> findByFarmId(Long farmId);
}
