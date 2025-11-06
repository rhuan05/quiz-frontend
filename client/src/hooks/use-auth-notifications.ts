import { useToast } from './use-toast';

export function useAuthNotifications() {
  const { toast } = useToast();

  const showLoginSuccess = (username?: string) => {
    toast({
      title: "✅ Login realizado com sucesso!",
      description: username ? `Bem-vindo, ${username}!` : "Você está logado no sistema.",
      duration: 3000,
    });
  };

  const showLogoutSuccess = () => {
    toast({
      title: "👋 Logout realizado",
      description: "Você foi desconectado do sistema.",
      duration: 3000,
    });
  };

  const showAutoLogout = () => {
    toast({
      title: "🔐 Sessão expirada",
      description: "Sua sessão expirou e você foi desconectado automaticamente.",
      duration: 4000,
      variant: "destructive",
    });
  };

  const showGoogleLoginSuccess = (username?: string) => {
    toast({
      title: "✅ Login com Google realizado!",
      description: username ? `Bem-vindo, ${username}!` : "Você está logado com sua conta Google.",
      duration: 3000,
    });
  };

  return {
    showLoginSuccess,
    showLogoutSuccess,
    showAutoLogout,
    showGoogleLoginSuccess,
  };
}