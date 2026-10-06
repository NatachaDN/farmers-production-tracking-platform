package com.farmer.tracking.modules.auth.repository;

import com.farmer.tracking.modules.auth.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByEmailOrPhone(String emailOrPhone);

    boolean existsByEmailOrPhone(String emailOrPhone);
}
