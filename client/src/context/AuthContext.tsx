import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  profile?: {
    displayName?: string;
    profileUrl?: string;
  };
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Validate token format (JWT has 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        setToken(null);
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiClient.getCurrentUser();
        // Server returns { success: true, data: { id, username, ... } }
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
