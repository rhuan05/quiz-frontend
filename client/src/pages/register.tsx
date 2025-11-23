import React, { useState } from "react";
import { apiRequest } from "../lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleLoginButton } from "../components/auth/google-login-button";
import { CompleteProfileModal } from "../components/auth/complete-profile-modal";
import { EmailVerificationModal } from "../components/auth/email-verification-modal";
import { useAuth } from "../contexts/auth-context";

export default function RegisterContent() {
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [, setLocation] = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const { completeUserProfile } = useAuth();
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        
        if (passwordError) {
            setPasswordError('');
        }
        
        if (confirmPassword && value !== confirmPassword) {
            setPasswordError('As senhas não coincidem');
        } else if (confirmPassword && value === confirmPassword) {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        
        if (password && value !== password) {
            setPasswordError('As senhas não coincidem');
        } else if (password && value === password) {
            setPasswordError('');
        }
    };

    const validatePasswords = () => {
        if (!password) {
            setPasswordError('A senha é obrigatória');
            return false;
        }
        
        if (password.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres');
            return false;
        }
        
        if (!confirmPassword) {
            setPasswordError('Confirme sua senha');
            return false;
        }
        
        if (password !== confirmPassword) {
            setPasswordError('As senhas não coincidem');
            return false;
        }
        
        return true;
    };
    
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [userRegistrationData, setUserRegistrationData] = useState<any>(null);
    const [oauthData, setOauthData] = useState<{
        email: string;
        needsPhone?: boolean;
        needsUsername?: boolean;
        isOAuth?: boolean;
    } | null>(null);
    
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!validatePasswords()) {
            setIsLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await apiRequest("POST", "/api/cadastro", data);
            const result = await res.json();

            if (!res.ok) {
                setMessage(result.message || "Erro desconhecido.");
                setIsSuccess(false);
            } else {
                setMessage(result.message);
                setIsSuccess(true);
                
                if (result.requiresEmailVerification) {
                    setUserRegistrationData({
                        email: data.email,
                        passwordHash: result.passwordHash
                    });
                    setOauthData({ 
                        email: data.email as string,
                        needsPhone: true,
                        needsUsername: true,
                        isOAuth: false
                    });
                    setShowEmailVerification(true);
                } else {
                    setTimeout(() => {
                        setLocation('/login');
                    }, 2000);
                }
            }
        } catch (err: any) {
            setMessage(err.message);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSuccess = () => {
        setLocation('/');
    };

    const handleGoogleRequiresInfo = (data: { email: string; needsPhone?: boolean; needsUsername?: boolean }) => {
        setOauthData({
            ...data,
            isOAuth: true
        });
        if (data.needsPhone || data.needsUsername) {
            setShowCompleteProfile(true);
        } else {
            setLocation('/');
        }
    };

    const handleCompleteProfile = () => {
        setShowCompleteProfile(false);
        setLocation('/');
    };

    const customCompleteProfile = async (profileData: { username?: string; phone?: string }) => {
        await completeUserProfile({
            email: oauthData!.email,
            ...profileData
        });
    };

    const handleEmailVerified = () => {
        setShowEmailVerification(false);
        
        if (userRegistrationData?.email) {
            setOauthData({
                email: userRegistrationData.email,
                needsPhone: true,
                needsUsername: true,
                isOAuth: false
            });
            setShowCompleteProfile(true);
        } else {
            setLocation('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Criar conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Cadastre-se para acessar os quizzes
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Cadastro</CardTitle>
                        <CardDescription>
                            Informações adicionais serão solicitadas após o cadastro
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {message && (
                                <Alert variant={isSuccess ? "default" : "destructive"}>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            {passwordError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="seu@email.com"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="Digite sua senha"
                                        disabled={isLoading}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Mínimo de 6 caracteres
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        placeholder="Confirme sua senha"
                                        disabled={isLoading}
                                        required
                                        className={`pr-10 ${
                                            confirmPassword 
                                                ? password === confirmPassword 
                                                    ? 'border-green-500 focus:border-green-500' 
                                                    : 'border-red-500 focus:border-red-500'
                                                : ''
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p className={`text-xs ${
                                        password === confirmPassword 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {password === confirmPassword 
                                            ? '✓ As senhas coincidem' 
                                            : '✗ As senhas não coincidem'
                                        }
                                    </p>
                                )}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading || !!passwordError || !password || !confirmPassword}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    'Cadastrar'
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
                                    Já tem uma conta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setLocation('/login')}
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Faça login aqui
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
                        userData={userRegistrationData}
                    />
                )}
            </div>
        </div>
    );
};