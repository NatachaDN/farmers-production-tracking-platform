package com.farmer.tracking.modules.notification.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.notification.dto.NotificationDtos.*;
import com.farmer.tracking.modules.notification.model.Notification;
import com.farmer.tracking.modules.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationResponse send(Long senderId, String senderName, SendNotificationRequest request) {
        Notification n = new Notification();
        n.setSenderId(senderId);
        n.setSenderName(senderName != null ? senderName : "Platform Administration");
        n.setRecipientId(request.recipientId());
        if (request.recipientId() == null) {
            String role = request.recipientRole();
            n.setRecipientRole((role == null || role.isBlank()) ? "ALL" : role.trim().toUpperCase());
        } else {
            n.setRecipientRole(null);
        }
        n.setTitle(request.title().trim());
        n.setMessage(request.message().trim());
        n.setType((request.type() == null || request.type().isBlank()) ? "INFO" : request.type().trim().toUpperCase());
        n.setRead(false);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(Long userId, String role) {
        return notificationRepository.findForUser(userId, role).stream()
                .limit(50)
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllSent() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(100)
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        n.setRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead(Long userId, String role) {
        List<Notification> list = notificationRepository.findForUser(userId, role);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(list);
    }
}
