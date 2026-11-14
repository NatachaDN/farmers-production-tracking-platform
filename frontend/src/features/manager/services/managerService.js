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
   * Supervise all crop cycles, harvest records, and livestock groups across supervised farmers
   */
  async getProductions({ search = '', farmerId = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (farmerId && String(farmerId).trim() && farmerId !== 'ALL') params.append('farmerId', farmerId);
    if (status && status.trim() && status !== 'ALL') params.append('status', status.trim());

    const qs = params.toString();
    return await apiClient.get(`/manager/productions${qs ? `?${qs}` : ''}`);
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

  // ── Shared Farm, Plot, Animal Group & Incident Management (Admin + Manager) ──

  async listFarms(search = '') {
    const qs = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return await apiClient.get(`/manager/farms${qs}`);
  },
  async createFarm(payload) {
    return await apiClient.post('/manager/farms', payload);
  },
  async updateFarm(id, payload) {
    return await apiClient.put(`/manager/farms/${id}`, payload);
  },
  async deleteFarm(id) {
    return await apiClient.delete(`/manager/farms/${id}`);
  },

  async listPlots({ search = '', farmId = '' } = {}) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (farmId) params.append('farmId', farmId);
    const qs = params.toString();
    return await apiClient.get(`/manager/plots${qs ? `?${qs}` : ''}`);
  },
  async createPlot(payload) {
    return await apiClient.post('/manager/plots', payload);
  },
  async updatePlot(id, payload) {
    return await apiClient.put(`/manager/plots/${id}`, payload);
  },
  async deletePlot(id) {
    return await apiClient.delete(`/manager/plots/${id}`);
  },

  async listAnimalGroups(search = '') {
    const qs = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return await apiClient.get(`/manager/animal-groups${qs}`);
  },
  async createAnimalGroup(payload) {
    return await apiClient.post('/manager/animal-groups', payload);
  },
  async updateAnimalGroup(id, payload) {
    return await apiClient.put(`/manager/animal-groups/${id}`, payload);
  },
  async deleteAnimalGroup(id) {
    return await apiClient.delete(`/manager/animal-groups/${id}`);
  },

  async listIncidents({ kind = '', status = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (kind && kind !== 'ALL') params.append('kind', kind);
    if (status && status !== 'ALL') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    const qs = params.toString();
    return await apiClient.get(`/manager/incidents${qs ? `?${qs}` : ''}`);
  },
  async takeIncidentAction(kind, id, payload) {
    return await apiClient.put(`/manager/incidents/${kind}/${id}/action`, payload);
  },
};

