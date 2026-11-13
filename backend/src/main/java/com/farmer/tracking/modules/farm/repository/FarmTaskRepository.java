package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.FarmTask;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmTaskRepository extends JpaRepository<FarmTask, Long> {
    List<FarmTask> findByFarmerIdAndDateBetweenOrderByDateAscIdAsc(Long farmerId, LocalDate from, LocalDate to);
    List<FarmTask> findTop10ByFarmerIdAndCompletedFalseAndDateLessThanEqualOrderByDateAscIdAsc(Long farmerId, LocalDate through);
    Optional<FarmTask> findByIdAndFarmerId(Long id, Long farmerId);
}
