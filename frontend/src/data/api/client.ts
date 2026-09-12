import axios from 'axios';

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
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
