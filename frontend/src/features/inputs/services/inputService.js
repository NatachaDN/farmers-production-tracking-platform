import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service for managing farm inputs (seeds, fertilizers, pesticides).
 */
export const inputService = {
  /**
   * Register or update a farm input.
   * If the input already exists, its stock and cumulative cost are updated.
   * @param {number} farmerId
   * @param {Object} data - { name, type, quantity, unit, purchaseDate, purchasePrice }
   */
  async registerOrUpdateInput(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/inputs`, data);
  },

  /**
   * List all inputs for a farmer, optionally filtered by type.
   * @param {number} farmerId
   * @param {string|null} type - SEEDS | FERTILIZER | PESTICIDE | OTHER
   */
  async getInputs(farmerId, type = null) {
    const url = type
      ? `/farmers/${farmerId}/inputs?type=${type}`
      : `/farmers/${farmerId}/inputs`;
    return await apiClient.get(url);
  },

  /**
   * Get a specific input by ID.
   * @param {number} farmerId
   * @param {number} inputId
   */
  async getInputById(farmerId, inputId) {
    return await apiClient.get(`/farmers/${farmerId}/inputs/${inputId}`);
  },

  /**
   * Delete a farm input by ID.
   * @param {number} farmerId
   * @param {number} inputId
   */
  async deleteInput(farmerId, inputId) {
    return await apiClient.delete(`/farmers/${farmerId}/inputs/${inputId}`);
  }
};
