import { apiClient } from '../../../shared/services/apiClient';

const qs = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

/** Read-only calls to /api/v1/admin (administrators only). */
export const adminService = {
  overview: () => apiClient.get('/admin/overview'),
  farmers: (q) => apiClient.get(`/admin/farmers${qs({ q })}`),
  farmer: (id) => apiClient.get(`/admin/farmers/${id}`),
  activities: ({ type, limit = 300 } = {}) => apiClient.get(`/admin/activities${qs({ type, limit })}`),
  cycles: (status) => apiClient.get(`/admin/cycles${qs({ status })}`),
  harvests: () => apiClient.get('/admin/harvests'),
  inputs: () => apiClient.get('/admin/inputs'),
  audit: (limit = 200) => apiClient.get(`/admin/audit${qs({ limit })}`),
  telemetry: () => apiClient.get('/admin/telemetry'),
};
