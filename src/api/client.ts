// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Log the error for debugging purposes
    console.error('API Error:', error.response?.data || error.message);

    // Here you could add more sophisticated error handling,
    // like redirecting to login on 401 errors, etc.

    // Reject the promise to let the caller handle the error
    return Promise.reject(error);
  }
);

export default api;
