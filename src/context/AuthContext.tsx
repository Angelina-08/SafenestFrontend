import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const interceptorRef = useRef<number>();

  // Set up axios interceptor for token
  useEffect(() => {
    interceptorRef.current = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorRef.current !== undefined) {
        axios.interceptors.request.eject(interceptorRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('userData');

        if (!storedToken || !storedUserData) {
          setLoading(false);
          return;
        }

        // Verify token with backend
        try {
          const response = await axios.get('https://safe-nest-back-end.vercel.app/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });

          if (response.data.valid) {
            // Use the latest user data from the server
            const userData = response.data.user;
            // Update localStorage with latest data
            localStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);
            setToken(storedToken);
          } else {
            // If token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Don't clear storage on network errors to prevent unnecessary logouts
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    // Remove all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Clear state
    setToken(null);
    setUser(null);
    setError(null);

    // Remove Authorization header from future requests
    delete axios.defaults.headers.common['Authorization'];
    
    // Remove our request interceptor
    if (interceptorRef.current !== undefined) {
      axios.interceptors.request.eject(interceptorRef.current);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
