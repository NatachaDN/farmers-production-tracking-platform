import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage cycle incident API requests.
 * Base URL: /api/v1/farmers/{farmerId}/cycles/{cycleId}/incidents
 */
export const cycleIncidentService = {
  /**
   * Fetch all incidents for a given crop cycle.
   */
  async getIncidents(farmerId, cycleId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/incidents`);
  },

  /**
   * Fetch a single incident by ID.
   */
  async getIncident(farmerId, cycleId, incidentId) {
    return await apiClient.get(`/farmers/${farmerId}/cycles/${cycleId}/incidents/${incidentId}`);
  },

  /**
   * Create a new incident on a cycle.
   * @param {Object} data - { incidentType, incidentDate, description, severityLevel?, actionTaken? }
   */
  async createIncident(farmerId, cycleId, data) {
    return await apiClient.post(`/farmers/${farmerId}/cycles/${cycleId}/incidents`, data);
  },

  /**
   * Update an existing incident.
   */
  async updateIncident(farmerId, cycleId, incidentId, data) {
    return await apiClient.put(`/farmers/${farmerId}/cycles/${cycleId}/incidents/${incidentId}`, data);
  },

  /**
   * Delete an incident.
   */
  async deleteIncident(farmerId, cycleId, incidentId) {
    return await apiClient.delete(`/farmers/${farmerId}/cycles/${cycleId}/incidents/${incidentId}`);
  },
};
