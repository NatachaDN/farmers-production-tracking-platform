package com.farmer.tracking.modules.auth.repository;

import com.farmer.tracking.modules.auth.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    @Query("SELECT f FROM Farmer f WHERE f.emailOrPhone = :identifier")
    Optional<Farmer> findByEmailOrPhone(@Param("identifier") String identifier);

    @Query("SELECT COUNT(f) > 0 FROM Farmer f WHERE f.emailOrPhone = :identifier")
    boolean existsByEmailOrPhone(@Param("identifier") String identifier);
}
