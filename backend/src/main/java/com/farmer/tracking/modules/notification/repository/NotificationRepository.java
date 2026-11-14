package com.farmer.tracking.modules.notification.repository;

import com.farmer.tracking.modules.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
            SELECT n FROM Notification n
            WHERE n.recipientId = :userId
               OR (n.recipientId IS NULL AND (n.recipientRole = 'ALL' OR n.recipientRole = :role))
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findForUser(@Param("userId") Long userId, @Param("role") String role);

    List<Notification> findAllByOrderByCreatedAtDesc();
}
