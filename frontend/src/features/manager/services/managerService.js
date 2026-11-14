import { apiClient } from '../../../shared/services/apiClient.js';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8080/api/v1';

export const managerService = {
  /**
   * Fetch aggregated summary for the manager dashboard (US-33)
   */
  async getDashboard() {
    return await apiClient.get('/manager/dashboard');
  },

  /**
   * List all registered farmers with optional search, region, crop, status filters, and sorting (US-31, US-32)
   */
  async getFarmers({ search = '', region = '', crop = '', status = '', sort = 'name' } = {}) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (region && region.trim() && region !== 'ALL') params.append('region', region.trim());
    if (crop && crop.trim() && crop !== 'ALL') params.append('crop', crop.trim());
    if (status && status.trim() && status !== 'ALL') params.append('status', status.trim());
    if (sort && sort.trim()) params.append('sort', sort.trim());

    const qs = params.toString();
    const endpoint = `/manager/farmers${qs ? `?${qs}` : ''}`;
    return await apiClient.get(endpoint);
  },

  /**
   * Drill down into a specific farmer's farms, plots, cycles, harvests, incidents, and livestock (US-33)
   */
  async getFarmerDetail(farmerId) {
    return await apiClient.get(`/manager/farmers/${farmerId}`);
  },

  /**
   * Approve or reject a farmer's registration status (US-34)
   */
  async updateFarmerStatus(farmerId, status, rejectionReason = '') {
    return await apiClient.put(`/manager/farmers/${farmerId}/status`, {
      status,
      rejectionReason: rejectionReason ? rejectionReason.trim() : null,
    });
  },

  /**
   * Generate a multi-farmer consolidated production report (US-35)
   */
  async generateConsolidatedReport({ startDate, endDate, farmerIds = [], region = '', crop = '' } = {}) {
    return await apiClient.post('/manager/reports/consolidated', {
      startDate: startDate || null,
      endDate: endDate || null,
      farmerIds: farmerIds && farmerIds.length > 0 ? farmerIds : null,
      region: region && region !== 'ALL' ? region : null,
      crop: crop && crop !== 'ALL' ? crop : null,
    });
  },

  /**
   * Export consolidated report as downloadable CSV file (US-35)
   */
  async downloadConsolidatedReportCsv({ startDate, endDate, farmerIds = [], region = '', crop = '' } = {}) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('acrea_token') : null;
    const response = await fetch(`${API_BASE_URL}/manager/reports/consolidated/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        startDate: startDate || null,
        endDate: endDate || null,
        farmerIds: farmerIds && farmerIds.length > 0 ? farmerIds : null,
        region: region && region !== 'ALL' ? region : null,
        crop: crop && crop !== 'ALL' ? crop : null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to export consolidated report CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acrea-consolidated-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  },
};

