import { useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useAuthNotifications } from './use-auth-notifications';

let autoLogoutFunction: (() => void) | null = null;
let showAutoLogoutNotification: (() => void) | null = null;

export function setAutoLogoutFunction(logoutFn: () => void) {
  autoLogoutFunction = logoutFn;
}

export function setAutoLogoutNotification(notificationFn: () => void) {
  showAutoLogoutNotification = notificationFn;
}

export function triggerAutoLogout() {
  if (autoLogoutFunction) {
    console.log('🔐 Token expirado - fazendo logout automático');
    autoLogoutFunction();
    
    if (showAutoLogoutNotification) {
      showAutoLogoutNotification();
    }
  }
}

export function useAutoLogout() {
  const { logout } = useAuth();
  const { showAutoLogout } = useAuthNotifications();
  
  useEffect(() => {
    setAutoLogoutFunction(logout);
    setAutoLogoutNotification(showAutoLogout);
    
    return () => {
      autoLogoutFunction = null;
      showAutoLogoutNotification = null;
    };
  }, [logout, showAutoLogout]);
}