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
  },

  /**
   * Update an existing plot.
   * @param {number} farmerId
   * @param {number} plotId
   * @param {Object} data - { name: string, area: number, location: string, cropType?: string, stage?: string, farmId?: number }
   */
  async updatePlot(farmerId, plotId, data) {
    return await apiClient.put(`/farmers/${farmerId}/plots/${plotId}`, data);
  },

  /**
   * Delete a plot by ID.
   * @param {number} farmerId
   * @param {number} plotId
   * @param {boolean} force - Force deletion even if linked to active cycles
   */
  async deletePlot(farmerId, plotId, force = false) {
    const query = force ? '?force=true' : '';
    return await apiClient.delete(`/farmers/${farmerId}/plots/${plotId}${query}`);
  }
};
