import { apiClient } from './apiClient';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    csrfToken?: string;
  };
}

export class AuthService {
  static getAuthCookieName(): string {
    return import.meta.env.VITE_AUTH_COOKIE_NAME || 'smart_navigator_token';
  }

  static hasAuthCookie(): boolean {
    const name = this.getAuthCookieName();
    return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`));
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data.user;
  }

  static async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.user;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data.user;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<AuthResponse>('/auth/profile', data);
    return response.data.user;
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  }

  static async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  static async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }

  static async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  static async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  }
}
