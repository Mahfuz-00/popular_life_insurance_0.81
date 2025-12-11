import axios from 'axios';

// Increase timeout for slow networks
const instance = axios.create({
  timeout: 15000, // 15 seconds (was 5s – better for mobile)
});

// Optional: Add request interceptor to auto-add token if needed later
instance.interceptors.request.use(
  async (config) => {
    // You can auto-inject token here in future
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;

// Keep axiosPrivate if you ever use refresh tokens
export const axiosPrivate = axios.create({
  baseURL: 'http://localhost:3500',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});