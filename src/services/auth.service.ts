import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { User } from '@/types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<LoginResponse>(API_ENDPOINTS.register, data),

  login: (email: string, password: string) =>
    api.post<LoginResponse>(API_ENDPOINTS.login, { email, password }),

  getMe: () => api.get<User>(API_ENDPOINTS.me),

  updateProfile: (data: Partial<User> & { name?: string }) =>
    api.patch<User>(API_ENDPOINTS.updateProfile, data),
};
