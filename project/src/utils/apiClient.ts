import { refreshAccessToken } from '../contexts/AuthContext';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://127.0.0.1:8000/api';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient(endpoint: string, options: ApiOptions = {}) {
  const { skipAuth = false, ...fetchOptions } = options;

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    if (!skipAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const makeRequest = async (): Promise<Response> => {
    return fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers: getHeaders(),
    });
  };

  let response = await makeRequest();

  // اگر 401 آمد و احراز هویت لازم دارد، سعی کن توکن را رفرش کنی
  if (response.status === 401 && !skipAuth) {
    const refreshFn = async () => {
      // اینجا باید به تابع رفرش دسترسی داشته باشی.
      // می‌توانی یک import از ماژول جداگانه انجام دهی یا از context استفاده کنی.
      // برای سادگی، فرض می‌کنیم تابع refreshAccessToken در یک فایل جدا مثل authHelper.ts هست.
      const { refreshAccessToken } = await import('../contexts/AuthContext');
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await makeRequest();
      } else {
        window.location.href = '/login';
      }
    };
    await refreshFn();
  }

  return response;
}