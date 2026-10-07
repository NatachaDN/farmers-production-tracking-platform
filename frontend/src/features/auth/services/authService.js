import { apiClient } from '../../../shared/services/apiClient';

const TOKEN_KEY = 'acrea_token';
const USER_KEY = 'acrea_user';

export const authService = {
  async register(formData) {
    const response = await apiClient.post('/auth/register', formData);
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.farmer));
    }
    return response;
  },

  async login(emailOrPhone, password) {
    const response = await apiClient.post('/auth/login', { emailOrPhone, password });
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.farmer));
    }
    return response;
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const user = await apiClient.get('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return this.getStoredUser();
    }
  },

  getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
