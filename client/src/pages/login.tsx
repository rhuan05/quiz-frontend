import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { GoogleLoginButton } from '../components/auth/google-login-button';
import { CompleteProfileModal } from '../components/auth/complete-profile-modal';
import { EmailVerificationModal } from '../components/auth/email-verification-modal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, completeUserProfile } = useAuth();
  const [, setLocation] = useLocation();
  
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [oauthData, setOauthData] = useState<{
    email: string;
    needsPhone?: boolean;
    needsUsername?: boolean;
    isOAuth?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const loginResult = await login(email, password);
      
      if (loginResult.requiresAdditionalInfo) {
        setOauthData({
          email: loginResult.email!,
          needsPhone: loginResult.needsPhone,
          needsUsername: loginResult.needsUsername,
          isOAuth: false
        });
        setShowCompleteProfile(true);
        return;
      }
      
      setLocation('/quiz');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  const handleGoogleSuccess = () => {
    setLocation('/quiz');
  };

  const handleGoogleRequiresInfo = (data: { email: string; needsPhone?: boolean; needsUsername?: boolean }) => {
    setOauthData({
      ...data,
      isOAuth: true
    });
    if (data.needsPhone || data.needsUsername) {
      setShowCompleteProfile(true);
    } else {
      setLocation('/quiz');
    }
  };

  const handleCompleteProfile = () => {
    setShowCompleteProfile(false);
    setLocation('/quiz');
  };

  const customCompleteProfile = async (profileData: { username?: string; phone?: string }) => {
    await completeUserProfile({
      email: oauthData!.email,
      ...profileData
    });
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setLocation('/quiz');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar seus quizzes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Digite seu email e senha para entrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onRequiresAdditionalInfo={handleGoogleRequiresInfo}
                className="w-full"
              />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setLocation('/register')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Cadastre-se aqui
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modais OAuth */}
        {showCompleteProfile && oauthData && (
          <CompleteProfileModal
            isOpen={showCompleteProfile}
            onClose={() => setShowCompleteProfile(false)}
            onComplete={handleCompleteProfile}
            email={oauthData.email}
            needsPhone={oauthData.needsPhone}
            needsUsername={oauthData.needsUsername}
            customSubmit={!oauthData.isOAuth ? customCompleteProfile : undefined}
          />
        )}

        {showEmailVerification && oauthData && (
          <EmailVerificationModal
            isOpen={showEmailVerification}
            onClose={() => setShowEmailVerification(false)}
            onVerified={handleEmailVerified}
            email={oauthData.email}
          />
        )}
      </div>
    </div>
  );
}
