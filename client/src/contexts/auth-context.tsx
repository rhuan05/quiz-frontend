import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../../../config.json';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  // Simple JWT decode function (for demo purposes)
  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded && decoded.exp > Date.now() / 1000) {
        setToken(savedToken);
        setUser({
          id: decoded.id,
          email: decoded.email, // Backend uses username field for email
          username: decoded.username,
          role: decoded.role || 'user'
        });
      } else {
        // Token expired, remove it
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      
      // Decode user info from token
      const decoded = decodeToken(data.token);
      if (decoded) {
        setUser({
          id: decoded.id,
          email: decoded.email, // Backend uses email field for email
          username: decoded.username,
          role: decoded.role || 'user'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    setLocation('/')
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
