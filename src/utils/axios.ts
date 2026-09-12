import axios from 'axios';
import { API, REDIRECT_API, SECONDARYAPI } from '../config';

// In-memory active URL state for the current session
let activeBaseUrl: string = API;

// Increase timeout for slow networks
const instance = axios.create({
  timeout: 15000, // 15 seconds (was 5s – better for mobile)
});

// Helper functions to manage session URL state
export const resetBaseUrlSession = () => {
  activeBaseUrl = API;
};

export const getActiveBaseUrl = () => activeBaseUrl;

// Request Interceptor: Attach current active base URL dynamically
instance.interceptors.request.use(
  (config) => {
    // If request URL is relative or uses full URL, construct using active base URL
    if (config.url) {
      // 🛑 SAFETY GUARD: If the request explicitly targets SECONDARYAPI, do NOT touch it
      if (config.url.startsWith(SECONDARYAPI)) {
        return config;
      }

      // Strips old base URL if explicitly provided in request string
      let relativePath = config.url
        .replace(API, '')
        .replace(REDIRECT_API, '');

      if (!relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }

      config.baseURL = activeBaseUrl;
      config.url = relativePath;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch network errors/timeouts and failover
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger failover if network error or timeout occurs on primary URL
    const isNetworkOrTimeout = !error.response || error.code === 'ECONNABORTED';
    const isPrimaryActive = activeBaseUrl === API;

    if (isNetworkOrTimeout && isPrimaryActive && !originalRequest._retry) {
      originalRequest._retry = true;

      // Switch session base URL to Secondary
      activeBaseUrl = REDIRECT_API;
      console.warn(`[Axios Failover] Switching Base URL to: ${activeBaseUrl}`);

      // Update current request configuration and retry
      let relativePath = originalRequest.url
        .replace(API, '')
        .replace(REDIRECT_API, '');

      if (!relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }

      originalRequest.baseURL = activeBaseUrl;
      originalRequest.url = relativePath;

      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default instance;

// Optional: Add request interceptor to auto-add token if needed later
// instance.interceptors.request.use(
//   async (config) => {
//     // You can auto-inject token here in future
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default instance;

// Keep axiosPrivate if you ever use refresh tokens
export const axiosPrivate = axios.create({
  baseURL: 'http://localhost:3500',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});