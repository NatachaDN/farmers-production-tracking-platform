import { apiClient } from './apiClient';

export const notificationService = {
  getMyNotifications: () => apiClient.get('/notifications'),
  getAllSent: () => apiClient.get('/notifications/sent'),
  send: (payload) => apiClient.post('/notifications/send', payload),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.put('/notifications/read-all', {}),
};

