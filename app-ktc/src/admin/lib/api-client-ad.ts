/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { type InternalAxiosRequestConfig } from 'axios';

const URL = 'http://localhost:3333/api'; 
// const URL = 'https://rentalroom-51g4.onrender.com/api'

const apiClient = Axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!) : null;

    const access_token = authStorage?.state?.access_token;

    if (config.headers === undefined) {
      config.headers = new Axios.AxiosHeaders();
    }

    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    config.headers.Accept = 'application/json';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const storage = localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!) : null;

    const refresh_token = storage?.state?.refresh_token;

    if (!refresh_token) {
      console.error('No refresh token available');
      return null;
    }

    // Create a new axios instance to avoid interceptors
    const refreshApiClient = Axios.create({
      baseURL: URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response: any = await refreshApiClient.post('/auth/refresh-token', { refresh_token });

    if (!response || !response.data || !response.data.access_token) {
      console.error('Invalid refresh token response');
      return null;
    }

    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          ...storage.state,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        },
      })
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    // If refresh token is invalid (401/403), clear storage and redirect
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return null;
  }
};

// Flag to prevent multiple refresh attempts simultaneously
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a login request - if so, don't redirect automatically
    if (originalRequest.url === '/auth/login') {
      return Promise.reject(error);
    }

    // Check if this is a refresh token request - if so, don't retry
    if (originalRequest.url === '/auth/refresh-token') {
      return Promise.reject(error);
    }

    // Check if it's an auth error and we haven't already retried
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();

        if (newAccessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);

          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          console.error('Unable to refresh token, redirecting to login');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        console.error('Refresh token failed:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;