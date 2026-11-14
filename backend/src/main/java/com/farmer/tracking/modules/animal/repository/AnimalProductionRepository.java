package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.model.AnimalProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalProductionRepository extends JpaRepository<AnimalProduction, Long> {
    List<AnimalProduction> findByAnimalGroupIdAndFarmerIdOrderByProductionDateDesc(Long animalGroupId, Long farmerId);
    Optional<AnimalProduction> findByIdAndAnimalGroupIdAndFarmerId(Long id, Long animalGroupId, Long farmerId);
    void deleteByAnimalGroupId(Long animalGroupId);
}

