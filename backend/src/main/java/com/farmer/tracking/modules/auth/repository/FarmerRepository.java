package com.farmer.tracking.modules.auth.repository;

import com.farmer.tracking.modules.auth.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.List;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    List<Farmer> findByManagerIdAndRole(Long managerId, String role);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select f from Farmer f where f.googleId = :googleId")
    Optional<Farmer> findLockedByGoogleId(@org.springframework.data.repository.query.Param("googleId") String googleId);

    @Query("SELECT f FROM Farmer f WHERE f.emailOrPhone = :identifier")
    Optional<Farmer> findByEmailOrPhone(@Param("identifier") String identifier);

    Optional<Farmer> findByGoogleId(String googleId);

    @Query("SELECT COUNT(f) > 0 FROM Farmer f WHERE f.emailOrPhone = :identifier")
    boolean existsByEmailOrPhone(@Param("identifier") String identifier);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Farmer f where f.id = :id")
    Optional<Farmer> findLockedById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Farmer f where f.emailOrPhone = :identifier")
    Optional<Farmer> findLockedByEmailOrPhone(@Param("identifier") String identifier);
}
