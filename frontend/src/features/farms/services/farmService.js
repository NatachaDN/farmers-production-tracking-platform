import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage Farm creation, retrieval, and updates.
 */
export const farmService = {
  /**
   * List all farms for a farmer.
   * @param {number} farmerId
   */
  async getFarms(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/farms`);
  },

  /**
   * Get farm details by ID.
   * @param {number} farmerId
   * @param {number} farmId
   */
  async getFarmById(farmerId, farmId) {
    return await apiClient.get(`/farmers/${farmerId}/farms/${farmId}`);
  },

  /**
   * Create a new farm.
   * @param {number} farmerId
   * @param {Object} data - { name: string, location?: string, description?: string, isDefault?: boolean }
   */
  async createFarm(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/farms`, data);
  },

  /**
   * Update an existing farm.
   * @param {number} farmerId
   * @param {number} farmId
   * @param {Object} data - { name: string, location?: string, description?: string, isDefault?: boolean }
   */
  async updateFarm(farmerId, farmId, data) {
    return await apiClient.put(`/farmers/${farmerId}/farms/${farmId}`, data);
  },

  /**
   * Set a farm as the default container.
   * @param {number} farmerId
   * @param {number} farmId
   */
  async setDefaultFarm(farmerId, farmId) {
    return await apiClient.patch(`/farmers/${farmerId}/farms/${farmId}/default`);
  },

  /**
   * Delete a farm.
   * @param {number} farmerId
   * @param {number} farmId
   */
  async deleteFarm(farmerId, farmId) {
    return await apiClient.delete(`/farmers/${farmerId}/farms/${farmId}`);
  }
};
