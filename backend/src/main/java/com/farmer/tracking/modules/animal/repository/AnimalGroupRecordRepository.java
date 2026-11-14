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
    List<AnimalGroupRecord> findTop5ByGroup_Farmer_IdAndGroup_Farm_IdAndKindOrderByDateDescIdDesc(Long farmerId, Long farmId, Kind kind);

    @org.springframework.data.jpa.repository.Query("""
            select r from AnimalGroupRecord r join fetch r.group g join fetch g.farm f
            where f.type = com.farmer.tracking.modules.auth.model.FarmType.LIVESTOCK
              and r.kind = com.farmer.tracking.modules.animal.model.AnimalGroupRecord.Kind.PRODUCTION
              and r.date between :from and :to
              and (:farmerId is null or g.farmer.id = :farmerId)
              and (:managerId is null or (g.farmer.managerId = :managerId and g.farmer.role = 'ROLE_FARMER'))
            order by r.date desc, r.id desc
            """)
    List<AnimalGroupRecord> productionReport(Long farmerId, Long managerId, java.time.LocalDate from, java.time.LocalDate to);
}
