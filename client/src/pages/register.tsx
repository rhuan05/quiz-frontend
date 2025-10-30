import React, { useState } from "react";
import { apiRequest } from "../lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";
import { GoogleLoginButton } from "../components/auth/google-login-button";
import { CompleteProfileModal } from "../components/auth/complete-profile-modal";
import { EmailVerificationModal } from "../components/auth/email-verification-modal";

export default function RegisterContent() {
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [, setLocation] = useLocation();
    const [username, setUsername] = useState('');
    
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedValue = value
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9._]/g, '')
            .toLowerCase();
        setUsername(formattedValue);
    };
    
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [oauthData, setOauthData] = useState<{
        email: string;
        needsPhone?: boolean;
        needsUsername?: boolean;
    } | null>(null);
    
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

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
                    setOauthData({ email: data.email as string });
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
        setLocation('/quiz');
    };

    const handleGoogleRequiresInfo = (data: { email: string; needsPhone?: boolean; needsUsername?: boolean }) => {
        setOauthData(data);
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

    const handleEmailVerified = () => {
        setShowEmailVerification(false);
        setLocation('/login');
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
                            Preencha os dados para criar sua conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {message && (
                                <Alert variant={isSuccess ? "default" : "destructive"}>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username">Nome de usuário</Label>
                                <Input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="ex: joaosilva123"
                                    disabled={isLoading}
                                    required
                                    className="font-mono"
                                />
                                <p className="text-xs text-gray-500">
                                    Apenas letras, números, pontos e underscores. Sem espaços.
                                </p>
                            </div>

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
                                <Input
                                    type="password"
                                    name="password"
                                    id="password"
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
};