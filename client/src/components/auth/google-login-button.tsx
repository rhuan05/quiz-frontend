import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/auth-context';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onRequiresAdditionalInfo?: (data: { email: string; needsPhone?: boolean; needsUsername?: boolean }) => void;
  className?: string;
}

export function GoogleLoginButton({ 
  onSuccess, 
  onRequiresAdditionalInfo, 
  className
}: GoogleLoginButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Token Google não recebido');
      return;
    }

    setError(null);

    try {
      const result = await loginWithGoogle(credentialResponse.credential);

      if (result.requiresAdditionalInfo) {
        onRequiresAdditionalInfo?.({
          email: result.email || '',
          needsPhone: result.needsPhone,
          needsUsername: result.needsUsername,
        });
      } else {
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('❌ Erro no login Google:', error);
      setError(error.message || 'Erro no login com Google');
    }
  };

  const handleGoogleError = () => {
    setError('Falha ao fazer login com Google');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          text="signin_with"
          shape="rectangular"
          theme="outline"
          size="large"
        />
      </div>
    </div>
  );
}