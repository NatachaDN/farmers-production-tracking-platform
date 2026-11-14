package com.farmer.tracking.modules.notification.service;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.notification.dto.NotificationDtos.*;
import com.farmer.tracking.modules.notification.model.Notification;
import com.farmer.tracking.modules.notification.model.NotificationRead;
import com.farmer.tracking.modules.notification.repository.NotificationReadRepository;
import com.farmer.tracking.modules.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationReadRepository notificationReadRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationReadRepository = notificationReadRepository;
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
        Set<Long> readBroadcasts = notificationReadRepository.findReadNotificationIds(userId);
        return notificationRepository.findForUser(userId, role).stream()
                .limit(50)
                .map(n -> NotificationResponse.from(n, isReadBy(n, readBroadcasts)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllSent() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(100)
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * Marks a notification as read for the signed-in user only. A notification the user cannot see
     * answers 404, so ids belonging to other users cannot be probed or modified.
     */
    @Transactional
    public NotificationResponse markRead(Long notificationId, Long userId, String role) {
        Notification n = notificationRepository.findById(notificationId)
                .filter(x -> isVisibleTo(x, userId, role))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        markReadFor(n, userId);
        return NotificationResponse.from(n, true);
    }

    @Transactional
    public void markAllRead(Long userId, String role) {
        for (Notification n : notificationRepository.findForUser(userId, role)) {
            markReadFor(n, userId);
        }
    }

    private void markReadFor(Notification n, Long userId) {
        if (isDirect(n)) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        } else if (!notificationReadRepository.existsByNotificationIdAndUserId(n.getId(), userId)) {
            notificationReadRepository.save(new NotificationRead(n.getId(), userId));
        }
    }

    private static boolean isDirect(Notification n) {
        return n.getRecipientId() != null;
    }

    /** Same visibility rule as {@link NotificationRepository#findForUser}. */
    private static boolean isVisibleTo(Notification n, Long userId, String role) {
        if (isDirect(n)) {
            return Objects.equals(n.getRecipientId(), userId);
        }
        return "ALL".equals(n.getRecipientRole()) || Objects.equals(n.getRecipientRole(), role);
    }

    private static boolean isReadBy(Notification n, Set<Long> readBroadcasts) {
        return isDirect(n) ? n.isRead() : readBroadcasts.contains(n.getId());
    }
}
