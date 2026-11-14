package com.farmer.tracking.modules.plot.repository;

import com.farmer.tracking.modules.plot.entity.Plot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Long> {

    @Override
    @EntityGraph(attributePaths = {"farm"})
    List<Plot> findAll();

    @EntityGraph(attributePaths = {"farm"})
    List<Plot> findByFarmerId(Long farmerId);

    Optional<Plot> findByIdAndFarmerId(Long id, Long farmerId);

    @EntityGraph(attributePaths = {"farm"})
    List<Plot> findByFarmId(Long farmId);

    @Query("SELECT DISTINCT p.farmerId FROM Plot p WHERE p.farm.id IN :farmIds AND p.farmerId IS NOT NULL")
    List<Long> findDistinctFarmerIdsByFarmIdIn(@Param("farmIds") Collection<Long> farmIds);
}
