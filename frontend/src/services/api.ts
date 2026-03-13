import axios from 'axios';

// Dynamically determine the default base URL to allow local dev while preventing CORS/Mixed Content issues
let defaultBaseURL = '/api/v1'; // Default to relative path for Vercel/proxies

if (typeof window !== 'undefined') {
  if (window.location.hostname === 'localhost') {
    defaultBaseURL = 'http://localhost:8000/api/v1';
  } else if (window.location.hostname === '34.122.205.37') {
    defaultBaseURL = 'http://34.122.205.37:8000/api/v1';
  }
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
