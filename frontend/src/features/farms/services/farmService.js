import { apiClient } from '../../../shared/services/apiClient';

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
  updateFarm: async (id, farmData) => {
    const data = await apiClient.put(`/farms/${id}`, farmData);
    return data;
  }
};
