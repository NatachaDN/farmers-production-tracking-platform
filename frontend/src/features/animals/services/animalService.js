import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service for managing animal groups (livestock).
 */
export const animalService = {
  /**
   * Register a new animal group.
   * @param {number} farmerId
   * @param {Object} data - { type, purpose, numberOfAnimals, startDate, notes }
   */
  async registerGroup(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/animals`, data);
  },

  /**
   * List all animal groups for a farmer.
   * @param {number} farmerId
   */
  async getGroups(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/animals`);
  },

  /**
   * Get a specific animal group by ID.
   * @param {number} farmerId
   * @param {number} groupId
   */
  async getGroupById(farmerId, groupId) {
    return await apiClient.get(`/farmers/${farmerId}/animals/${groupId}`);
  },

  /**
   * Update an existing animal group.
   * @param {number} farmerId
   * @param {number} groupId
   * @param {Object} data
   */
  async updateGroup(farmerId, groupId, data) {
    return await apiClient.put(`/farmers/${farmerId}/animals/${groupId}`, data);
  },

  /**
   * Delete an animal group by ID.
   * @param {number} farmerId
   * @param {number} groupId
   */
  async deleteGroup(farmerId, groupId) {
    return await apiClient.delete(`/farmers/${farmerId}/animals/${groupId}`);
  }
};
