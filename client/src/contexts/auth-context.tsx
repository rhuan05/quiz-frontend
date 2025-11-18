import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../../../config.json';
import { useAuthNotifications } from '../hooks/use-auth-notifications';

interface User {
  id: string;
  email: string;
  username: string | null;
  phone?: string | null;
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
  login: (email: string, password: string) => Promise<{ requiresAdditionalInfo?: boolean; needsPhone?: boolean; needsUsername?: boolean; email?: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ requiresAdditionalInfo?: boolean; needsPhone?: boolean; needsUsername?: boolean; email?: string }>;
  completeUserProfile: (data: { email: string; phone?: string; username?: string }) => Promise<void>;
  completeGoogleAuth: (data: { email: string; phone?: string; username?: string }) => Promise<void>;
  sendVerificationEmailWithUserData: (email: string, userData: any) => Promise<void>;
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
  const { showLoginSuccess, showLogoutSuccess, showGoogleLoginSuccess } = useAuthNotifications();

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded && decoded.exp > Date.now() / 1000) {
        setToken(savedToken);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch {
            setUser({
              id: decoded.id,
              email: decoded.email,
              username: decoded.username,
              role: decoded.role || 'user',
              isPremium: false
            });
          }
        } else {
          setUser({
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role || 'user',
            isPremium: false
          });
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
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
      
      const needsUsername = !data.user.username;
      const needsPhone = !data.user.phone;
      const requiresAdditionalInfo = needsUsername || needsPhone;
      
      if (requiresAdditionalInfo) {
        return {
          requiresAdditionalInfo: true,
          needsUsername,
          needsPhone,
          email: data.user.email
        };
      }
      
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        phone: data.user.phone,
        displayName: data.user.displayName,
        avatar: data.user.avatar,
        role: data.user.role || 'user',
        isPremium: false
      };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      showLoginSuccess(userData.username || userData.email);
      
      return {};
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
    localStorage.removeItem('authUser');
    
    showLogoutSuccess();
    
    setLocation('/');
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
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      showGoogleLoginSuccess(data.user.username);
      
      return {};
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeUserProfile = async (data: { email: string; phone?: string; username?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao completar perfil');
      }

      const result = await response.json();
      
      setToken(result.token);
      localStorage.setItem('authToken', result.token);
      setUser(result.user);
      localStorage.setItem('authUser', JSON.stringify(result.user));
      
      showLoginSuccess(result.user.username || result.user.email);
      
    } catch (error) {
      console.error('Complete user profile error:', error);
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
      localStorage.setItem('authUser', JSON.stringify(result.user));
      
      showGoogleLoginSuccess(result.user.username);
      
    } catch (error) {
      console.error('Complete Google auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmailWithUserData = async (email: string, userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar email de verificação');
      }
    } catch (error) {
      console.error('Send verification email with user data error:', error);
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
        completeUserProfile,
        completeGoogleAuth,
        sendVerificationEmailWithUserData,
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
