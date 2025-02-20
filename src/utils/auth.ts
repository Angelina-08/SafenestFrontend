import axios from 'axios';

const API_URL = 'https://safe-nest-back-end.vercel.app/api';

interface TokenResponse {
  token: string;
  refreshToken: string;
  user?: {
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
}

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
};

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<TokenResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken }
    );

    const { token, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken);

    return true;
  } catch (error) {
    clearAuthData();
    return false;
  }
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    // Instead of making a verify request, check if token exists in local storage
    // and try to use it with an authenticated endpoint
    await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid, try to refresh
      return await refreshAuthToken();
    }
    return false;
  }
};

// Create an axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to handle token refresh
authAxios.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAuthToken();
      if (refreshed) {
        const token = localStorage.getItem('token');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return authAxios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
