package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.model.AnimalGroup;
import com.farmer.tracking.modules.animal.model.AnimalGroupStatus;
import com.farmer.tracking.modules.animal.model.AnimalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalGroupRepository extends JpaRepository<AnimalGroup, Long> {

    @Query("SELECT g FROM AnimalGroup g WHERE g.farmer.id = :farmerId ORDER BY g.createdAt DESC")
    List<AnimalGroup> findByFarmerIdOrderByCreatedAtDesc(@Param("farmerId") Long farmerId);

    @Query("SELECT g FROM AnimalGroup g WHERE g.farmer.id = :farmerId AND g.animalType = :animalType ORDER BY g.createdAt DESC")
    List<AnimalGroup> findByFarmerIdAndAnimalTypeOrderByCreatedAtDesc(@Param("farmerId") Long farmerId, @Param("animalType") AnimalType animalType);

    @Query("SELECT g FROM AnimalGroup g WHERE g.farmer.id = :farmerId AND g.status = :status ORDER BY g.createdAt DESC")
    List<AnimalGroup> findByFarmerIdAndStatusOrderByCreatedAtDesc(@Param("farmerId") Long farmerId, @Param("status") AnimalGroupStatus status);

    @Query("SELECT g FROM AnimalGroup g WHERE g.id = :id AND g.farmer.id = :farmerId")
    Optional<AnimalGroup> findByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(g) > 0 FROM AnimalGroup g WHERE g.id = :id AND g.farmer.id = :farmerId")
    boolean existsByIdAndFarmerId(@Param("id") Long id, @Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(g) FROM AnimalGroup g WHERE g.farmer.id = :farmerId")
    long countByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COALESCE(SUM(g.currentPopulation), 0) FROM AnimalGroup g WHERE g.farmer.id = :farmerId AND g.status = 'ACTIVE'")
    long sumActivePopulationByFarmerId(@Param("farmerId") Long farmerId);
}

