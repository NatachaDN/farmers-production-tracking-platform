import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage the farmer's personal list of crops and varieties.
 */
export const cropService = {
  /**
   * List all crops for a farmer.
   * @param {number} farmerId
   */
  async getCrops(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/crops`);
  },

  /**
   * Get details of a single crop.
   * @param {number} farmerId
   * @param {number} cropId
   */
  async getCropById(farmerId, cropId) {
    return await apiClient.get(`/farmers/${farmerId}/crops/${cropId}`);
  },

  /**
   * Register a new crop in the farmer's personal list.
   * @param {number} farmerId
   * @param {{ name: string, variety?: string }} data
   */
  async createCrop(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/crops`, data);
  },

  /**
   * Update an existing crop's name or variety.
   * @param {number} farmerId
   * @param {number} cropId
   * @param {{ name: string, variety?: string }} data
   */
  async updateCrop(farmerId, cropId, data) {
    return await apiClient.put(`/farmers/${farmerId}/crops/${cropId}`, data);
  },

  /**
   * Remove a crop from the farmer's list.
   * @param {number} farmerId
   * @param {number} cropId
   */
  async deleteCrop(farmerId, cropId) {
    return await apiClient.delete(`/farmers/${farmerId}/crops/${cropId}`);
  }
};
