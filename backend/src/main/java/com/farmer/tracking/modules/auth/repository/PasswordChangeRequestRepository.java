package com.farmer.tracking.modules.auth.repository;

import com.farmer.tracking.modules.auth.model.PasswordChangeRequest;
import com.farmer.tracking.modules.auth.model.PasswordChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordChangeRequestRepository extends JpaRepository<PasswordChangeRequest, Long> {

    List<PasswordChangeRequest> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    boolean existsByFarmerIdAndStatus(Long farmerId, PasswordChangeRequestStatus status);

    List<PasswordChangeRequest> findAllByOrderByCreatedAtDesc();

    List<PasswordChangeRequest> findByStatusOrderByCreatedAtDesc(PasswordChangeRequestStatus status);

    long countByStatus(PasswordChangeRequestStatus status);
}

