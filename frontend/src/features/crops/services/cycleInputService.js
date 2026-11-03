import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service for managing input consumption records on crop production cycles.
 * Endpoints: /api/v1/farmers/{farmerId}/cycles/{cycleId}/inputs
 */
export const cycleInputService = {
  /**
   * Record a new input consumption on an active cycle.
   * Deducts the used quantity from available inventory stock.
   * @param {number} farmerId
   * @param {number} cycleId
   * @param {Object} data - { inputId, quantityUsed, usageDate?, notes? }
   */
  async recordInputUsage(farmerId, cycleId, data) {
    return await apiClient.post(`/farmers/${farmerId}/cycles/${cycleId}/inputs`, data);
  },

  /**
   * List all input consumptions for a specific cycle.
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getInputsByCycle(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/inputs`);
  },

  /**
   * Get cost summary for a cycle (total cost, breakdown by input type, items list).
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getCostSummary(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/inputs/summary`);
  },

  /**
   * Delete an input usage record and restore the deducted stock.
   * @param {number} farmerId
   * @param {number} cycleId
   * @param {number} usageId
   */
  async deleteInputUsage(farmerId, cycleId, usageId) {
    return await apiClient.delete(`/farmers/${farmerId}/cycles/${cycleId}/inputs/${usageId}`);
  }
};
