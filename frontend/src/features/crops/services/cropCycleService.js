import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage Crop Production Cycles API requests.
 */
export const cropCycleService = {
  /**
   * List all production cycles for a farmer, optionally filtered by status.
   * @param {number} farmerId
   * @param {string} [status] - 'ACTIVE' | 'COMPLETED'
   */
  async getCycles(farmerId, status) {
    const endpoint = status
      ? `/farmers/${farmerId}/cycles?status=${status}`
      : `/farmers/${farmerId}/cycles`;
    return await apiClient.get(endpoint);
  },

  /**
   * Get production cycle details by ID.
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getCycleById(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}`);
  },

  /**
   * Create a new crop production cycle.
   * @param {number} farmerId
   * @param {Object} data - { plotId, cropName, name?, plantingDate, plannedHarvestDate?, expectedQuantity?, expectedQuantityUnit?, acreage?, stage?, allowConflict? }
   */
  async createCycle(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/cycles`, data);
  },

  /**
   * Check if a plot is currently occupied by an active cycle.
   * @param {number} farmerId
   * @param {number} plotId
   */
  async checkPlotAvailability(farmerId, plotId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/check-plot/${plotId}`);
  }
};
