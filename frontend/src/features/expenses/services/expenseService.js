import { apiClient } from '../../../shared/services/apiClient';

/**
 * Service for managing production-related expenses (input purchases, labor, transport).
 */
export const expenseService = {
  /**
   * Record a new expense.
   * @param {number} farmerId
   * @param {Object} data - { description, type, amount, expenseDate, notes }
   */
  async recordExpense(farmerId, data) {
    return await apiClient.post(`/farmers/${farmerId}/expenses`, data);
  },

  /**
   * List all expenses for a farmer, newest first.
   * @param {number} farmerId
   */
  async getExpenses(farmerId) {
    return await apiClient.get(`/farmers/${farmerId}/expenses`);
  },

  /**
   * Delete an expense by ID.
   * @param {number} farmerId
   * @param {number} expenseId
   */
  async deleteExpense(farmerId, expenseId) {
    return await apiClient.delete(`/farmers/${farmerId}/expenses/${expenseId}`);
  }
};
