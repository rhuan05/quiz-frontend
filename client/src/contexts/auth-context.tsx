import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../../../config.json';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: 'admin' | 'user';
  isPremium: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<{ requiresAdditionalInfo?: boolean; needsPhone?: boolean; needsUsername?: boolean; email?: string }>;
  completeGoogleAuth: (data: { email: string; phone?: string; username?: string }) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
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

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(prev => prev ? { ...prev, isPremium: userData.isPremium } : null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const loginWithGoogle = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login com Google falhou');
      }

      const data = await response.json();
      
      if (data.requiresAdditionalInfo) {
        return {
          requiresAdditionalInfo: true,
          needsPhone: data.needsPhone,
          needsUsername: data.needsUsername,
          email: data.email,
        };
      }

      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      
      return {};
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleAuth = async (data: { email: string; phone?: string; username?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao completar autenticação');
      }

      const result = await response.json();
      
      setToken(result.token);
      localStorage.setItem('authToken', result.token);
      setUser(result.user);
      
    } catch (error) {
      console.error('Complete Google auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar email de verificação');
      }
    } catch (error) {
      console.error('Send verification email error:', error);
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Código inválido ou expirado');
      }
      
      if (user && user.email === email) {
        setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      }
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle,
        completeGoogleAuth,
        sendVerificationEmail,
        verifyEmail,
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
