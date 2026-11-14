import { apiClient } from '../../../shared/services/apiClient';

const qs = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

/** Read-only calls to /api/v1/admin (administrators only). */
function consoleService(prefix) {
  return {
    overview: () => apiClient.get(`${prefix}/overview`),
    farmers: q => apiClient.get(`${prefix}/farmers${qs({ q })}`),
    farmer: id => apiClient.get(`${prefix}/farmers/${id}`),
    updateAccess: (id, change) => apiClient.put(`${prefix}/farmers/${id}/access`, change),
    activities: ({ type, limit = 300 } = {}) => apiClient.get(`${prefix}/activities${qs({ type, limit })}`),
    cycles: status => apiClient.get(`${prefix}/cycles${qs({ status })}`),
    harvests: () => apiClient.get(`${prefix}/harvests`),
    inputs: () => apiClient.get(`${prefix}/inputs`),
    livestock: (from, to) => apiClient.get(`${prefix}/livestock-production${qs({ from, to })}`),
  };
}

export const managerService = consoleService('/manager');
export const adminService = {
  ...consoleService('/admin'),
  audit: (limit = 200) => apiClient.get(`/admin/audit${qs({ limit })}`),
  telemetry: () => apiClient.get('/admin/telemetry'),
  passwordRequests: (status) => apiClient.get(`/admin/password-requests${qs({ status })}`),
  approvePasswordRequest: (id, adminNote) => apiClient.post(`/admin/password-requests/${id}/approve`, { adminNote }),
  rejectPasswordRequest: (id, adminNote) => apiClient.post(`/admin/password-requests/${id}/reject`, { adminNote }),
};
