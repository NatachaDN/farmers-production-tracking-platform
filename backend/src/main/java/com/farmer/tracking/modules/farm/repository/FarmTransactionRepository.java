package com.farmer.tracking.modules.farm.repository;

import com.farmer.tracking.modules.farm.model.FarmTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmTransactionRepository extends JpaRepository<FarmTransaction, Long> {
    List<FarmTransaction> findByFarmerIdOrderByDateDescIdDesc(Long farmerId);
}
