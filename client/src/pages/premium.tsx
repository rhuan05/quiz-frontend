import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Loader2, Crown, Calendar, CheckCircle, QrCode, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";

interface PremiumStatus {
  isPremium: boolean;
  premiumExpiresAt?: string;
  daysRemaining?: number;
}

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'expired' | 'cancelled' | 'failed';
  pixCode?: string;
  qrCodeUrl?: string;
  createdAt: string;
  mercadoPagoPaymentId?: string;
  type?: 'pix';
}

export default function PremiumPage(): React.ReactElement {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user) {
      loadPremiumStatus();
    }
  }, [user]);

  useEffect(() => {
    let interval: number | null = null;
    
    if (currentPayment && currentPayment.status === 'pending') {
      console.log('🔄 Starting payment status polling for:', currentPayment.id);
      
      interval = setInterval(() => {
        console.log('📡 Checking payment status...');
        checkPaymentStatus(currentPayment.id);
      }, 3000);
    } else {
      console.log('⏹️ Stopping payment polling - status:', currentPayment?.status);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPayment]);

  const loadPremiumStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/user/premium-status');
      
      if (response.ok) {
        const data = await response.json();
        setPremiumStatus(data);
      }
    } catch (err: any) {
      console.error('❌ Error loading premium status:', err);
    }
  };

  const createPixPayment = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiRequest('POST', '/api/payments/pix', { 
        amount: 24.90,
        payer: {
          email: user?.email
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pagamento PIX');
      }

      const data = await response.json();
      
      const payment = {
        id: data.paymentId,
        amount: data.amount,
        status: 'pending' as const,
        pixCode: data.pixCopyPaste,
        qrCodeUrl: data.pixQrCode,
        createdAt: new Date().toISOString(),
        mercadoPagoPaymentId: data.mercadoPagoPaymentId,
        type: 'pix' as const
      };
      
      setCurrentPayment(payment);
      
      if (data.isSimulated) {
        setSuccess(data.message || 'Pagamento PIX criado (simulado)! Use o QR Code ou código PIX para pagar.');
      } else {
        setSuccess('Pagamento PIX criado com sucesso! Use o QR Code ou código PIX para pagar.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await apiRequest('GET', `/api/payments/${paymentId}/status`);
      
      if (response.ok) {
        const data = await response.json();
        const paymentData = data.payment;
        
        const payment = {
          id: paymentData.mercadoPagoPaymentId || paymentData.id,
          amount: paymentData.amount || currentPayment?.amount || 1.00,
          status: paymentData.status === 'approved' ? 'approved' as const : 
                  paymentData.status === 'rejected' || paymentData.status === 'cancelled' || paymentData.status === 'expired' ? 'failed' as const : 
                  'pending' as const,
          pixCode: currentPayment?.pixCode,
          qrCodeUrl: currentPayment?.qrCodeUrl,
          createdAt: paymentData.createdAt || currentPayment?.createdAt || new Date().toISOString(),
          type: 'pix' as const
        };
        
        setCurrentPayment(payment);

        if (paymentData.status === 'approved') {
          const premiumInfo = data.premiumStatus;
          let successMessage = '🎉 Pagamento realizado com sucesso! Agora você é um usuário premium!';
          
          if (premiumInfo && premiumInfo.expiresAt) {
            const expiresDate = new Date(premiumInfo.expiresAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            });
            successMessage = `🎉 Você agora é um usuário premium até o dia ${expiresDate}!`;
          } else {
            successMessage = '🎉 Pagamento realizado com sucesso! Você agora é um usuário premium!';
          }
          
          setSuccess(successMessage);
          loadPremiumStatus();
          
          window.dispatchEvent(new CustomEvent('premiumStatusChanged'));
          
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled' || paymentData.status === 'expired') {
          setError('Pagamento não foi aprovado. Tente novamente.');
          setCurrentPayment(null);
        }
      }
    } catch (err: any) {
      console.error('❌ Error checking payment status:', err);
    }
  };

  const copyPixCode = () => {
    const pixCode = currentPayment?.pixCode;
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateProgress = (daysRemaining: number) => {
    const totalDays = 30;
    const progress = Math.max(0, (daysRemaining / totalDays) * 100);
    return Math.round(progress);
  };



  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Premium QuizQuest
          </h1>
          <p className="mt-2 text-gray-600">
            Acesso ilimitado aos quizzes por 30 dias
          </p>
        </div>

        {/* Premium Plans */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Crown className="h-8 w-8 text-yellow-500" />
              QuizQuest Premium
            </CardTitle>
            <CardDescription className="text-base">
              Acesso ilimitado e recursos exclusivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Section */}
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                R$ 24,90
                <span className="text-lg font-normal text-gray-600 ml-2">por 30 dias</span>
              </div>
              <p className="text-sm text-gray-600">
                Cobrança única por 30 dias de acesso
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <p className="font-semibold text-gray-800 text-center mb-4">
                Tudo incluído no Premium:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Quizzes exclusivos e ilimitados por 30 dias
                    </p>
                    <p className="text-xs text-gray-600">
                      Sem limitações de tentativas ou categorias
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Feedback's instantâneos após cada quiz
                    </p>
                    <p className="text-xs text-gray-600">
                      Respostas detalhadas e explicações completas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Pontuação direta no ranking
                    </p>
                    <p className="text-xs text-gray-600">
                      Compete com outros usuários premium
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status for existing premium users */}
            {premiumStatus?.isPremium && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ativo
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Expira em {formatDate(premiumStatus.premiumExpiresAt!)}
                  </span>
                </div>
                
                {premiumStatus.daysRemaining !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Dias restantes</span>
                      <span className="font-medium">{premiumStatus.daysRemaining}</span>
                    </div>
                    <Progress 
                      value={calculateProgress(premiumStatus.daysRemaining)} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {premiumStatus.daysRemaining !== undefined && premiumStatus.daysRemaining <= 5 && (
                  <Alert className="mt-3">
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Seu acesso premium expira em breve! Renove agora para continuar aproveitando.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {premiumStatus?.isPremium ? 'Renovar Premium' : 'Ativar Premium'}
            </CardTitle>
            <CardDescription>
              30 dias de acesso premium por R$ 24,90
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Success/Error Messages */}
            {success && (
              <Alert variant="default" className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Payment Options */}
            {!currentPayment && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Pagamento via PIX</h3>
                    <p className="text-sm text-muted-foreground">
                      Pagamento instantâneo via PIX - QR Code oficial do MercadoPago
                    </p>
                  </div>


                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Email:</strong> {user?.email || 'Usuário logado'}
                    </p>
                    <p className="text-xs text-blue-600">
                      Pagamento será vinculado ao seu email de cadastro
                    </p>
                  </div>

                  <Button 
                    onClick={createPixPayment} 
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando PIX...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Gerar PIX - R$ 24,90
                      </>
                    )}
                  </Button>

                </div>
              </div>
            )}

            {/* PIX Payment Details */}
            {currentPayment && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">
                      Pagamento PIX Criado
                    </h3>
                    <Badge 
                      variant={
                        currentPayment.status === 'approved' ? 'default' : 
                        currentPayment.status === 'failed' || currentPayment.status === 'expired' || currentPayment.status === 'cancelled' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {currentPayment.status === 'pending' ? 'Aguardando' :
                       currentPayment.status === 'approved' ? 'Aprovado' : 
                       currentPayment.status === 'expired' ? 'Expirado' :
                       currentPayment.status === 'cancelled' ? 'Cancelado' : 'Falhou'}
                    </Badge>
                  </div>

                  <p className="text-sm text-blue-700 mb-3">
                    <strong>Valor: R$ {(24.90).toFixed(2)}</strong><br />
                    {currentPayment.status === 'pending' && 'Use o QR Code ou copie o código PIX abaixo para efetuar o pagamento.'}
                    {currentPayment.status === 'approved' && 'Pagamento aprovado! Seu acesso premium foi ativado.'}
                    {currentPayment.status === 'failed' && 'Pagamento não foi aprovado. Tente novamente.'}
                    {currentPayment.status === 'expired' && 'PIX expirou. Gere um novo pagamento.'}
                    {currentPayment.status === 'cancelled' && 'Pagamento foi cancelado.'}
                  </p>

                  {currentPayment.status === 'pending' && (
                    <>
                      {/* QR Code */}
                      {currentPayment.qrCodeUrl && (
                        <div className="text-center mb-4">
                          <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                            <img 
                              src={`data:image/png;base64,${currentPayment.qrCodeUrl}`} 
                              alt="QR Code PIX" 
                              className="mx-auto w-64 h-64 object-contain"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Escaneie o QR Code com o app do seu banco
                          </p>
                        </div>
                      )}

                      {/* Instruções */}
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                          <li>Abra o app do seu banco</li>
                          <li>Escolha a opção PIX</li>
                          <li>Escaneie o QR Code ou cole o código abaixo</li>
                          <li>Confirme o pagamento de R$ {(24.90).toFixed(2)}</li>
                        </ol>
                      </div>

                      {/* PIX Code */}
                      {currentPayment.pixCode && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Código PIX:
                          </label>
                          <div className="flex gap-2">
                            <div className="flex-1 p-2 bg-white border rounded text-xs font-mono break-all">
                              {currentPayment.pixCode}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copyPixCode}
                              className="shrink-0"
                            >
                              {copySuccess ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {copySuccess && (
                            <p className="text-xs text-green-600">
                              Código copiado!
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aguardando confirmação do pagamento...
                      </div>
                    </>
                  )}
                </div>

                {/* Botão para ir à Home após pagamento aprovado */}
                {currentPayment.status === 'approved' && (
                  <Button 
                    onClick={() => {
                      setCurrentPayment(null);
                      setSuccess(null);
                      setLocation('/'); // Ir para home
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    🏠 Ir para Home
                  </Button>
                )}

                {/* Botão Cancelar apenas para pagamentos pendentes */}
                {currentPayment.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentPayment(null);
                      setSuccess(null);
                      setError(null);
                    }}
                    className="w-full"
                  >
                    Cancelar Pagamento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}