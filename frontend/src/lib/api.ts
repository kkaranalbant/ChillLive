import axios from 'axios';
import { AuthResponse, RegisterData, LoginData, GuestData, User, ReportData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token invalid, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data),

  guestLogin: (data: GuestData) =>
    api.post<AuthResponse>('/auth/guest', data),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get<{ user: User }>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<{ message: string; user: User }>('/users/profile', data),

  updatePreferences: (preferences: User['preferences']) =>
    api.put<{ message: string; preferences: User['preferences'] }>('/users/preferences', preferences),
};

// Report API
export const reportAPI = {
  createReport: (data: ReportData) =>
    api.post('/reports', data),

  getReports: () =>
    api.get('/reports'),
};

export default api;
