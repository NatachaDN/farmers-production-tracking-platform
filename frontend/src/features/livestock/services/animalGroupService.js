import { apiClient } from '../../../shared/services/apiClient.js';

/**
 * Service for Animal Group / Livestock Management CRUD operations.
 */
export const animalGroupService = {
  /**
   * Fetch all animal groups owned by the authenticated farmer.
   */
  async getGroups() {
    return await apiClient.get('/animals/groups');
  },

  /**
   * Fetch details for a specific animal group by ID.
   */
  async getGroupById(id) {
    return await apiClient.get(`/animals/groups/${id}`);
  },

  /**
   * Register a new animal group.
   */
  async createGroup(groupData) {
    return await apiClient.post('/animals/groups', groupData);
  },

  /**
   * Update an existing animal group.
   */
  async updateGroup(id, groupData) {
    return await apiClient.put(`/animals/groups/${id}`, groupData);
  },

  /**
   * Delete an animal group.
   */
  async deleteGroup(id) {
    return await apiClient.delete(`/animals/groups/${id}`);
  }
};
