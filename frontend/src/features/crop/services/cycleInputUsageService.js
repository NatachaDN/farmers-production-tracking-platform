import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage cycle input consumption and real cost tracking.
 * Endpoints: /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs
 */
export const cycleInputUsageService = {
  /**
   * Record input consumption on an active crop cycle.
   * Deducts quantity from inventory stock and calculates real cost.
   * Fails if cycle is not active or quantity exceeds available stock.
   * @param {number} farmerId
   * @param {number} cycleId
   * @param {Object} data - { inputId: number, quantityUsed: number, usageDate: string, notes?: string }
   */
  async recordInputUsage(farmerId, cycleId, data) {
    return await apiClient.post(
      `/farmers/${farmerId}/cycles/${cycleId}/inputs`,
      data
    );
  },

  /**
   * Get all inputs consumed on a crop cycle.
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getInputsByCycle(farmerId, cycleId) {
    return await apiClient.get(
      `/farmers/${farmerId}/cycles/${cycleId}/inputs`
    );
  },

  /**
   * Get cycle input cost summary with expenditure breakdown by category.
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getCycleCostSummary(farmerId, cycleId) {
    return await apiClient.get(
      `/farmers/${farmerId}/cycles/${cycleId}/inputs/summary`
    );
  },

  /**
   * Delete an input usage record and restore deducted quantity back to stock.
   * @param {number} farmerId
   * @param {number} cycleId
   * @param {number} usageId
   */
  async deleteInputUsage(farmerId, cycleId, usageId) {
    return await apiClient.delete(
      `/farmers/${farmerId}/cycles/${cycleId}/inputs/${usageId}`
    );
  }
};
