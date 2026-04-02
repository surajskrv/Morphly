import axios from 'axios';

// Dynamically determine the default base URL
let defaultBaseURL = '/api/v1'; // Default to relative path for production proxies

if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  defaultBaseURL = 'http://localhost:8000/api/v1';
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || defaultBaseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const existingAuthHeader =
    config.headers?.Authorization ||
    (config.headers as Record<string, string | undefined> | undefined)?.authorization;

  // Preserve explicit Authorization headers (e.g. login flow using a freshly issued token).
  if (token && !existingAuthHeader) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login') &&
      !originalRequest._retry
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          null,
          { params: { refresh_token: refreshToken } }
        );
        const newToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;
        localStorage.setItem('token', newToken);
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        onRefreshed(newToken);
        return api(originalRequest);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
