import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage harvest API requests.
 */
export const harvestService = {
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
