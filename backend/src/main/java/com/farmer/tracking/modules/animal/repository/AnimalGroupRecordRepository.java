package com.farmer.tracking.modules.animal.repository;

import com.farmer.tracking.modules.animal.model.AnimalGroupRecord;
import java.util.List;
import java.util.Collection;
import com.farmer.tracking.modules.animal.model.AnimalGroupRecord.Kind;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalGroupRecordRepository extends JpaRepository<AnimalGroupRecord, Long> {
    List<AnimalGroupRecord> findByGroup_IdOrderByDateDescIdDesc(Long groupId);
    boolean existsByGroup_Id(Long groupId);
    boolean existsByGroup_IdAndKindIn(Long groupId, Collection<Kind> kinds);
    List<AnimalGroupRecord> findTop5ByGroup_Farmer_IdAndKindOrderByDateDescIdDesc(Long farmerId, Kind kind);
}
