import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { ApiResponse } from '@/types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearAuth();
      return null;
    }
    const data = await res.json();
    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;
    if (!newAccessToken || !newRefreshToken) {
      await clearAuth();
      return null;
    }
    await setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    await clearAuth();
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, { ...options, headers });

  // Handle 401 — try refresh once
  if (response.status === 401 && retry) {
    const newToken = await refreshOnce();
    if (newToken) {
      return request<T>(endpoint, options, false);
    }
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, 'Invalid server response');
  }

  if (!response.ok || !data.success) {
    throw new ApiError(response.status, data.error ?? 'Request failed');
  }

  return data.data as T;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  postForm: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      headers: {} as HeadersInit, // let browser set multipart boundary
      body: formData,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
