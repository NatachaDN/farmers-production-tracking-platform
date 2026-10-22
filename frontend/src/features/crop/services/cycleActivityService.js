import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage cycle activity API requests.
 */
export const cycleActivityService = {
  /**
   * Fetch all activities for a given crop cycle.
   */
  async getActivities(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/activities`);
  },

  /**
   * Fetch a single activity by ID.
   */
  async getActivity(farmerId, cycleId, activityId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/activities/${activityId}`);
  },

  /**
   * Create a new activity on a cycle.
   * @param {Object} data - { activityType: 'WATERING'|'TREATMENT'|'FERTILIZING'|'WEEDING', activityDate: 'YYYY-MM-DD', notes?: string }
   */
  async createActivity(farmerId, cycleId, data) {
    return await apiClient.post(`/farmers/${farmerId}/cycles/${cycleId}/activities`, data);
  },

  /**
   * Update an existing activity.
   */
  async updateActivity(farmerId, cycleId, activityId, data) {
    return await apiClient.put(`/farmers/${farmerId}/cycles/${cycleId}/activities/${activityId}`, data);
  },

  /**
   * Delete an activity.
   */
  async deleteActivity(farmerId, cycleId, activityId) {
    return await apiClient.delete(`/farmers/${farmerId}/cycles/${cycleId}/activities/${activityId}`);
  },
};
