import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Prefer same-origin Vite proxy to ensure cookies are sent; fall back to explicit env if provided
// Support both VITE_API_BASE_URL (project default) and VITE_API_URL (fallback)
const API_BASE_URL = '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true, // Important for HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url as string | undefined;

        // Suppress noisy console errors for expected unauthenticated checks
        const isAuthMe = typeof url === 'string' && url.includes('/auth/me');
        const isExpectedUnauthed = status === 401 && isAuthMe;

        if (import.meta.env.DEV && !isExpectedUnauthed) {
          console.error('[API Response Error]', {
            status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url,
          });
        }

        // Handle common error cases (avoid hard redirects to prevent reload loops)
        if (status === 401) {
          // Let PrivateRoute/Login handle unauthenticated state
          // No side-effects here to avoid reload loops.
        } else if (error.response?.status === 403) {
          // Forbidden - show error message
          if (import.meta.env.DEV) {
            console.warn('Access forbidden');
          }
        } else if (error.response?.status >= 500) {
          // Server error
          if (import.meta.env.DEV) {
            console.error('Server error occurred');
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: unknown): Error {
    const isObject = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null;

    if (axios.isAxiosError(error)) {
      const data = error.response?.data as unknown;
      if (isObject(data)) {
        const message = typeof data.message === 'string' ? data.message : typeof data.error === 'string' ? data.error : undefined;
        if (message) return new Error(message);
      }
      if (typeof error.message === 'string' && error.message) {
        return new Error(error.message);
      }
    } else if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // File upload utility
  async uploadFile<T = unknown>(url: string, file: File, additionalData?: Record<string, unknown>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      for (const key in additionalData) {
        formData.append(key, additionalData[key] as string);
      }
    }

    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
