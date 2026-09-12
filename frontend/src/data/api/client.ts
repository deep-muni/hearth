import axios from 'axios';

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8080/api`;
  }
  return 'http://localhost:8080/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    if (!config.baseURL || config.baseURL === '/api') {
      config.baseURL = `http://${host}:8080/api`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.response?.data || error.message || 'Request failed';
    return Promise.reject(
      new Error(typeof message === 'string' ? message : JSON.stringify(message))
    );
  }
);
