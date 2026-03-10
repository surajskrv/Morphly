import axios from 'axios';

const api = axios.create({
  // Using a relative URL lets Next.js rewrites handle the proxying to bypass Mixed Content errors
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
