package com.farmer.tracking.modules.auth.repository;

import com.farmer.tracking.modules.auth.model.Farmer;
import com.farmer.tracking.modules.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    List<PasswordResetToken> findByFarmerAndUsedFalse(Farmer farmer);

    Optional<PasswordResetToken> findByFarmerAndTokenAndUsedFalse(Farmer farmer, String token);

    Optional<PasswordResetToken> findByToken(String token);
}

