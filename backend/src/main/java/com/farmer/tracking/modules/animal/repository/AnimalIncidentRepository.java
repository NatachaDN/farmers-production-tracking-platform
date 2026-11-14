package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.model.AnimalIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalIncidentRepository extends JpaRepository<AnimalIncident, Long> {
    List<AnimalIncident> findByAnimalGroupIdAndFarmerIdOrderByIncidentDateDesc(Long animalGroupId, Long farmerId);
    Optional<AnimalIncident> findByIdAndAnimalGroupIdAndFarmerId(Long id, Long animalGroupId, Long farmerId);
    void deleteByAnimalGroupId(Long animalGroupId);
}

