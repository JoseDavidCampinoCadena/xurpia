import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getCookie, removeCookie } from '../utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 segundos timeout - increased for AI analysis
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        removeCookie('token');
        removeCookie('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();
export default axiosInstance;