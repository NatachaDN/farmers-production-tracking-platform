import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service to manage Farm creation, retrieval, and updates.
 */
export const farmService = {
  /**
   * Fetch all farms owned by the logged-in farmer.
   */
  getFarms: async () => {
    try {
      const data = await apiClient.get('/farms');
      return data;
    } catch (error) {
      console.warn('Failed to fetch farms from server, using fallback/local state:', error);
      throw error;
    }
  },

  /**
   * Fetch details for a specific farm by ID.
   */
  getFarmById: async (id) => {
    try {
      const data = await apiClient.get(`/farms/${id}`);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch farm #${id} from server:`, error);
      throw error;
    }
  },

  /**
   * Create a new farm record for the authenticated user.
   */
  createFarm: async (farmData) => {
    const data = await apiClient.post('/farms', farmData);
    return data;
  },

  /**
   * Update an existing farm record (owner verified server-side).
   */
  updateFarm: async (arg1, arg2, arg3) => {
    const id = arg3 ? arg2 : arg1;
    const farmData = arg3 ? arg3 : arg2;
    const data = await apiClient.put(`/farms/${id}`, farmData);
    return data;
  },

  /**
   * Upload a farm picture (JPEG, PNG, WebP) from the user's camera or device.
   * @param {File} file
   * @returns {Promise<{ url: string }>}
   */
  uploadFarmPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload('/farms/upload-image', formData);
  }
};