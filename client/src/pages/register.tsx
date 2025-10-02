import React, { useState } from "react";
import { apiRequest } from "../lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

export default function RegisterContent() {
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [, setLocation] = useLocation();
    
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
                setTimeout(() => {
                    setLocation('/login');
                }, 2000);
            }
        } catch (err: any) {
            setMessage(err.message);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    }

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
                                    placeholder="Digite seu nome de usuário"
                                    disabled={isLoading}
                                    required
                                />
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
            </div>
        </div>
    );
};