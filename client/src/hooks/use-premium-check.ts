import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { apiRequest } from '../lib/queryClient';

interface PremiumStatus {
  isPremium: boolean;
  premiumExpiresAt?: string;
  daysRemaining?: number;
}

export function usePremiumCheck() {
  const { isAuthenticated, user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPremiumStatus = async () => {
    if (!isAuthenticated || !user) {
      setPremiumStatus(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/user/premium-status');
      
      if (response.ok) {
        const data = await response.json();
        setPremiumStatus(data);
        return data;
      }
    } catch (err: any) {
      console.error('Error loading premium status:', err);
      setPremiumStatus(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    loadPremiumStatus();
  }, [isAuthenticated, user]);

  const checkPremiumAccess = async (): Promise<{
    hasAccess: boolean;
    message?: string;
    needsPremium?: boolean;
  }> => {
    if (!isAuthenticated || !user) {
      return {
        hasAccess: false,
        message: 'Você precisa estar logado para iniciar um quiz.',
        needsPremium: false
      };
    }

    const status = await loadPremiumStatus();
    
    if (!status || !status.isPremium) {
      return {
        hasAccess: false,
        message: 'Para iniciar o quiz e começar a pontuar você deve ser um usuário Premium. Conclua seu cadastro finalizando o pagamento de R$ 19,90 e comece a aprender!',
        needsPremium: true
      };
    }

    return {
      hasAccess: true
    };
  };

  return {
    premiumStatus,
    loading,
    checkPremiumAccess,
    loadPremiumStatus
  };
}