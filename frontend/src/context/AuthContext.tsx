import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import API, { getMe } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isRecruiterOrAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('techcorp_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token header with API client
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('techcorp_token', token);
      // Fetch profile
      getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Invalid or expired token
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('techcorp_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (newToken: string): Promise<User | null> => {
    setLoading(true);
    setToken(newToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    localStorage.setItem('techcorp_token', newToken);
    try {
      const userData = await getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to load user profile on login:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('techcorp_token');
  };

  const isAuthenticated = !!token && !!user;
  const isRecruiterOrAdmin = isAuthenticated && (user?.role === 'RECRUITER' || user?.role === 'ADMIN');
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isRecruiterOrAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
