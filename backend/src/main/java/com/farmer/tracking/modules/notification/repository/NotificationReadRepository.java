package com.farmer.tracking.modules.notification.repository;

import com.farmer.tracking.modules.notification.model.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {

    @Query("SELECT r.notificationId FROM NotificationRead r WHERE r.userId = :userId")
    Set<Long> findReadNotificationIds(@Param("userId") Long userId);

    boolean existsByNotificationIdAndUserId(Long notificationId, Long userId);
}
