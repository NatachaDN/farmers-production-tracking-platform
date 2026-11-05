const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('acrea_token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && token) {
        localStorage.removeItem('acrea_token');
        localStorage.removeItem('acrea_user');
        window.dispatchEvent(new Event('acrea-session-expired'));
      }
      const validationMsg = data?.validationErrors ? Object.values(data.validationErrors).join('. ') : null;
      const errorMessage = validationMsg || data?.message || 'Request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = 'Unable to connect to Acrea server. Please check your connection or server status.';
    }
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  upload: (endpoint, formData, options) => request(endpoint, { ...options, method: 'POST', body: formData }),
  put: (endpoint, body, options) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),

  /** Upload a file using multipart/form-data. Do NOT set Content-Type — browser sets it with the boundary. */
  async upload(endpoint, formData) {
    const token = localStorage.getItem('acrea_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, { method: 'POST', headers, body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401 && token) {
          localStorage.removeItem('acrea_token');
          localStorage.removeItem('acrea_user');
          window.dispatchEvent(new Event('acrea-session-expired'));
        }
        const errorMessage = data?.message || 'Upload failed';
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (!error.status) {
        error.message = 'Unable to connect to Acrea server. Please check your connection.';
      }
      throw error;
    }
  },
};
