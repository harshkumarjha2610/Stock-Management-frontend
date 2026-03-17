// lib/apiClient.ts
// Reusable API client with automatic token refresh for Cobuild API

const API_BASE_URL = 'https://cobuild-simulator-backend.onrender.com/api/v1';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

// Queue of callbacks waiting for token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    if (typeof window !== 'undefined') {
      window.location.href = '/login-page';
    }
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      console.log('Token refreshed successfully');
      return data.data.accessToken;
    } else {
      console.error('Token refresh failed:', data.message);
      localStorage.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login-page';
      }
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/login-page';
    }
    return null;
  }
};

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = localStorage.getItem('access_token');

  const headers = new Headers(options.headers as HeadersInit);

  if (!headers.get('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    console.log('Received 401, attempting token refresh...');

    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        // notify subscribers waiting for the new token
        onRefreshed(newToken);
        // update header and retry the original request
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          headers,
        });
      }
    } else {
      // If a refresh is already in progress, wait for it and then retry
      await new Promise<void>((resolve) => {
        addRefreshSubscriber((token: string) => {
          headers.set('Authorization', `Bearer ${token}`);
          resolve();
        });
      });

      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        headers,
      });
    }
  }

  return response;
};

export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, body?: any, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (endpoint: string, body?: any, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),

  postFormData: (endpoint: string, formData: FormData, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    }),

  putFormData: (endpoint: string, formData: FormData, options?: RequestInit) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: formData,
    }),
};

export default api;
