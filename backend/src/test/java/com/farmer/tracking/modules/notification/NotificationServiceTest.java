package com.farmer.tracking.modules.notification;

import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.modules.notification.dto.NotificationDtos.NotificationResponse;
import com.farmer.tracking.modules.notification.model.Notification;
import com.farmer.tracking.modules.notification.model.NotificationRead;
import com.farmer.tracking.modules.notification.repository.NotificationReadRepository;
import com.farmer.tracking.modules.notification.repository.NotificationRepository;
import com.farmer.tracking.modules.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationReadRepository notificationReadRepository;

    @InjectMocks
    private NotificationService notificationService;

    private static Notification direct(long id, long recipientId) {
        Notification n = new Notification();
        n.setId(id);
        n.setRecipientId(recipientId);
        n.setTitle("t");
        n.setMessage("m");
        return n;
    }

    private static Notification broadcast(long id, String role) {
        Notification n = new Notification();
        n.setId(id);
        n.setRecipientRole(role);
        n.setTitle("t");
        n.setMessage("m");
        return n;
    }

    @Test
    void markRead_OtherUsersNotification_NotFound() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(direct(1L, 42L)));

        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.markRead(1L, 7L, "ROLE_FARMER"));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markRead_Broadcast_OnlyForThatUser() {
        Notification n = broadcast(2L, "ALL");
        when(notificationRepository.findById(2L)).thenReturn(Optional.of(n));
        when(notificationReadRepository.existsByNotificationIdAndUserId(2L, 7L)).thenReturn(false);

        NotificationResponse response = notificationService.markRead(2L, 7L, "ROLE_FARMER");

        assertTrue(response.isRead());
        assertFalse(n.isRead(), "the shared flag must stay unread for the other recipients");
        verify(notificationReadRepository).save(any(NotificationRead.class));
    }

    @Test
    void getForUser_BroadcastReadState_IsPerUser() {
        Notification n = broadcast(3L, "ALL");
        when(notificationRepository.findForUser(7L, "ROLE_FARMER")).thenReturn(List.of(n));
        when(notificationReadRepository.findReadNotificationIds(7L)).thenReturn(Set.of());

        assertFalse(notificationService.getForUser(7L, "ROLE_FARMER").get(0).isRead());

        when(notificationReadRepository.findReadNotificationIds(7L)).thenReturn(Set.of(3L));
        assertTrue(notificationService.getForUser(7L, "ROLE_FARMER").get(0).isRead());
    }
}
