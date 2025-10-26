import { useDashboard } from "../../hooks/use-dashboard";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";

export default function DashboardContent() {
    const { startDashboard, quizCompleted, error, isLoading } = useDashboard();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    
    const handleStartDashboard = async () => {
        try {
            await startDashboard();
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const plan = urlParams.get('plan');
        const amount = urlParams.get('amount');
        
        if (paymentStatus === 'success') {
            const valorFormatado = amount ? `R$ ${(parseInt(amount) / 100).toFixed(2)}` : 'R$ 9,90';
            
            toast({
                title: "🎉 Pagamento realizado com sucesso!",
                description: `Seu plano ${plan || 'premium'} (${valorFormatado}) foi ativado. Aproveite todos os recursos!`,
                duration: 8000,
            });
            
            window.history.replaceState({}, '', '/dashboard');
            
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
        
        const run = async () => {
            handleStartDashboard();
        };

        run();
    }, [toast]);

    // Mostrar erro no estilo not-found
    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="pt-6">
                        <div className="flex mb-4 gap-2">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <h1 className="text-2xl font-bold text-gray-900">Falha ao acessar</h1>
                        </div>

                        <p className="mt-4 text-sm text-gray-600">
                            {error.message}
                        </p>

                        <Button 
                          onClick={() => setLocation('/')} 
                          className="mt-4 w-full"
                          variant="outline"
                        >
                          Voltar ao início
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mostrar loading ou conteúdo normal
    return (
        <div style={{ minHeight: 'calc(100vh - 65px)' }} className="flex items-center justify-center">
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-center text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                    {isLoading ? 'Carregando...' : (quizCompleted?.length ?? 0)}
                </h1>
                <h2 className="text-center text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Quizzes</span> concluídos!
                </h2>
            </div>
        </div>
    )
};