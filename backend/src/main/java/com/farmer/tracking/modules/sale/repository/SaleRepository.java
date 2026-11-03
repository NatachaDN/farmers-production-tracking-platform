package com.farmer.tracking.modules.sale.repository;

import com.farmer.tracking.modules.sale.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByFarmerIdOrderBySaleDateDescCreatedAtDesc(Long farmerId);

    List<Sale> findByCycleId(Long cycleId);

    Optional<Sale> findByIdAndFarmerId(Long id, Long farmerId);

    /** Sum of total revenue for all sales of a cycle. */
    @Query("SELECT COALESCE(SUM(s.totalRevenue), 0) FROM Sale s WHERE s.cycleId = :cycleId")
    BigDecimal sumTotalRevenueByCycleId(@Param("cycleId") Long cycleId);
}
