import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL;
const resolvedBaseUrl = rawUrl
  ? rawUrl.startsWith('http')
    ? `${rawUrl.replace(/\/+$/, '')}/api`
    : `https://${rawUrl.replace(/\/+$/, '')}/api`
  : '/api';

const API = axios.create({
  baseURL: resolvedBaseUrl,
});

// Add Authorization header with JWT token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthenticated errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, token is expired or invalid
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

