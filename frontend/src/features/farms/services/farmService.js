import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage Farm creation, retrieval, and updates.
 * Supports both scoped (/farmers/:farmerId/farms) and direct (/farms) patterns.
 */
export const farmService = {
  /**
   * List all farms for a farmer.
   * @param {number|string} [farmerId=1]
   */
  async getFarms(farmerId = 1) {
    try {
      return await apiClient.get(`/farmers/${farmerId}/farms`);
    } catch {
      return await apiClient.get('/farms');
    }
  },

  /**
   * Get farm details by ID.
   * @param {number|string} farmerId
   * @param {number|string} [farmId]
   */
  async getFarmById(farmerId, farmId) {
    if (farmId === undefined) {
      return await apiClient.get(`/farms/${farmerId}`);
    }
    return await apiClient.get(`/farmers/${farmerId}/farms/${farmId}`);
  },

  /**
   * Create a new farm.
   * @param {number|string|Object} farmerIdOrData
   * @param {Object} [data]
   */
  async createFarm(farmerIdOrData, data) {
    if (data !== undefined) {
      return await apiClient.post(`/farmers/${farmerIdOrData}/farms`, data);
    }
    return await apiClient.post('/farms', farmerIdOrData);
  },

  /**
   * Update an existing farm.
   * @param {number|string} farmerIdOrFarmId
   * @param {number|string|Object} farmIdOrData
   * @param {Object} [data]
   */
  async updateFarm(farmerIdOrFarmId, farmIdOrData, data) {
    if (data !== undefined) {
      return await apiClient.put(`/farmers/${farmerIdOrFarmId}/farms/${farmIdOrData}`, data);
    }
    return await apiClient.put(`/farms/${farmerIdOrFarmId}`, farmIdOrData);
  },

  /**
   * Set a farm as the default container.
   * @param {number|string} farmerId
   * @param {number|string} farmId
   */
  async setDefaultFarm(farmerId, farmId) {
    return await apiClient.patch(`/farmers/${farmerId}/farms/${farmId}/default`);
  },

  /**
   * Delete a farm.
   * @param {number|string} farmerId
   * @param {number|string} [farmId]
   */
  async deleteFarm(farmerId, farmId) {
    if (farmId === undefined) {
      return await apiClient.delete(`/farms/${farmerId}`);
    }
    return await apiClient.delete(`/farmers/${farmerId}/farms/${farmId}`);
  }
};
