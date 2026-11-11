import { apiClient } from '../../../shared/services/apiClient.js';
import { googleAuth } from './googleAuth.js';

const TOKEN_KEY = 'acrea_token';
const USER_KEY = 'acrea_user';

function persistSession(response) {
  if (response?.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.farmer));
  }
}

export const authService = {
  /** Finishes "Continue with Google" after Google redirects back to the app. */
  async completeGoogleSignIn() {
    const response = await googleAuth.complete();
    persistSession(response);
    return response;
  },

  isAdmin(user = this.getStoredUser()) {
    return user?.role === 'ROLE_ADMIN';
  },

  isManager(user = this.getStoredUser()) {
    return user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_ADMIN';
  },

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

  async updateProfile(profileData) {
    const updated = await apiClient.put('/auth/me', profileData);
    if (updated) {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  /** Upload an image file from the device and update the user's avatar. */
  async uploadAvatar(file) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const result = await apiClient.upload('/auth/upload-avatar', fd);
      if (result?.url) {
        const updated = await this.updateProfile({ avatarUrl: result.url });
        return updated || { avatarUrl: result.url };
      }
    } catch {
      // Fallback
    }

    const updated = await apiClient.upload('/auth/me/avatar', fd);
    if (updated) {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  async forgotPassword(emailOrPhone) {
    return await apiClient.post('/auth/forgot-password', { emailOrPhone });
  },

  async resetPassword(arg1, arg2, arg3, arg4) {
    let payload;
    if (typeof arg1 === 'object') {
      payload = arg1;
    } else {
      payload = {
        emailOrPhone: arg1,
        resetCode: arg2,
        newPassword: arg3,
        confirmPassword: arg4 || arg3,
      };
    }
    return await apiClient.post('/auth/reset-password', payload);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
