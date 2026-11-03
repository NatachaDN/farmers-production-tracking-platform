import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service for managing harvest sales and cycle margin.
 */
export const saleService = {
  /**
   * Record a new sale.
   * @param {number} farmerId
   * @param {Object} data - { cycleId, harvestId, quantitySold, unit, pricePerUnit, buyer, saleDate, notes }
   */
  async recordSale(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/sales`, data);
  },

  /**
   * List all sales for a farmer, newest first.
   * @param {number} farmerId
   */
  async getSales(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/sales`);
  },

  /**
   * List sales for a specific cycle.
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getSalesByCycle(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/sales`);
  },

  /**
   * Get margin calculation for a cycle (revenue minus associated expenses).
   * @param {number} farmerId
   * @param {number} cycleId
   */
  async getMargin(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/margin`);
  },

  /**
   * Delete a sale by ID.
   * @param {number} farmerId
   * @param {number} saleId
   */
  async deleteSale(farmerId, saleId) {
    return await apiClient.delete(`/farmers/${farmerId}/sales/${saleId}`);
  }
};
