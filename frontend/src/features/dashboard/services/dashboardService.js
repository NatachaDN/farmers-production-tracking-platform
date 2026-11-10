import { apiClient } from '../../../shared/services/apiClient';

export const dashboardService = {
  getSummary: (farmerId) => apiClient.get(`/farmers/${farmerId}/dashboard`),
};

