import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage plot registration and retrieval API requests.
 */
export const plotService = {
  /**
   * Register a new plot for a farmer.
   * @param {number} farmerId
   * @param {Object} data - { name: string, area: number, location: string, cropType?: string, stage?: string }
   */
  async createPlot(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/plots`, data);
  },

  /**
   * List all plots registered for a farmer.
   * @param {number} farmerId
   */
  async getPlots(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/plots`);
  },

  /**
   * Get plot details by ID.
   * @param {number} farmerId
   * @param {number} plotId
   */
  async getPlotById(farmerId, plotId) {
    return await apiClient.get(`/farmers/${farmerId}/plots/${plotId}`);
  }
};
