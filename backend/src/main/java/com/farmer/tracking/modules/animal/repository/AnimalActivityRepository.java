package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.model.AnimalActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalActivityRepository extends JpaRepository<AnimalActivity, Long> {
    List<AnimalActivity> findByAnimalGroupIdAndFarmerIdOrderByActivityDateDesc(Long animalGroupId, Long farmerId);
    Optional<AnimalActivity> findByIdAndAnimalGroupIdAndFarmerId(Long id, Long animalGroupId, Long farmerId);
    void deleteByAnimalGroupId(Long animalGroupId);
}
