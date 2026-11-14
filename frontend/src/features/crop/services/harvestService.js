import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage harvest API requests.
 */
export const harvestService = {
  deleteHarvest: (farmerId, cycleId) => apiClient.delete(`/farmers/${farmerId}/cycles/${cycleId}/harvest`),
  correctHarvest: (farmerId, cycleId, data) => apiClient.put(`/farmers/${farmerId}/cycles/${cycleId}/harvest`, data),
  getCorrections: (farmerId, cycleId) => apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/harvest/corrections`),
  /**
   * Record a harvest for an active cycle.
   * @param {number} farmerId
   * @param {number} cycleId
   * @param {Object} data - { quantity: number, unit: 'KG'|'BAGS'|'TONS', harvestDate: 'YYYY-MM-DD', notes?: string }
   */
  async recordHarvest(farmerId, cycleId, data) {
    return await apiClient.post(
      `/farmers/${farmerId}/cycles/${cycleId}/harvest`,
      data
    );
  },

  /**
   * Retrieve the harvest record for a completed cycle.
   */
  async getHarvest(farmerId, cycleId) {
    return await apiClient.get(
      `/farmers/${farmerId}/cycles/${cycleId}/harvest`
    );
  },
};
