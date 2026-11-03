package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.entity.AnimalGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalGroupRepository extends JpaRepository<AnimalGroup, Long> {

    /** Find all animal groups belonging to a farmer, ordered by start date descending. */
    List<AnimalGroup> findByFarmerIdOrderByStartDateDesc(Long farmerId);

    /** Find an animal group by ID only if owned by the specified farmer. */
    Optional<AnimalGroup> findByIdAndFarmerId(Long id, Long farmerId);

    /** Check if an animal group exists and belongs to farmer. */
    boolean existsByIdAndFarmerId(Long id, Long farmerId);
}
