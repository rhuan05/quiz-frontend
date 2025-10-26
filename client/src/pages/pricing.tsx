import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Zap, Crown, Infinity } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/auth-context';
import { API_BASE_URL } from '../../../config.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  features: string[];
  limitations?: string[];
}

interface CustomerData {
  name: string;
  email: string;
  cellphone: string;
  taxId: string;
}

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "🎉 Pagamento realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
        duration: 3000,
      });
      
      setTimeout(() => {
        setLocation('/dashboard?payment=success');
      }, 2000);
    }
  }, [toast, setLocation]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const [showPixForm, setShowPixForm] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeBase64?: string;
    qrCodeText: string;
    paymentId: string;
    amount: number;
    expiresAt?: string;
    paymentUrl?: string;
  } | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    cellphone: '',
    taxId: ''
  });
  const { user, isPremium, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  // Preencher dados do usuário quando disponível
  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        ...prev,
        name: prev.name || user.username || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/plans`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    
    if (!isAuthenticated) {
      toast({
        title: "Cadastre-se para continuar",
        description: "Crie sua conta para assinar o plano premium.",
      });
      setLocation('/register');
      return;
    }
    
    setSubscribingTo(planId);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.paymentUrl, '_blank');
        
        toast({
          title: "Redirecionado para pagamento",
          description: "Complete o pagamento na nova aba que se abriu.",
        });
      } else {
        throw new Error(data.message || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSubscribingTo(null);
    }
  };

  const handlePixPayment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Cadastre-se para continuar",
        description: "Crie sua conta para realizar o pagamento.",
      });
      setLocation('/register');
      return;
    }
    
    setShowPixForm(true);
  };

  const processPixPayment = async () => {
    if (!customerData.name || !customerData.email || !customerData.cellphone || !customerData.taxId) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(customerData.taxId)) {
      toast({
        title: "CPF inválido",
        description: "Digite apenas os números do CPF (11 dígitos).",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(customerData.cellphone.replace(/\D/g, ''))) {
      toast({
        title: "Telefone inválido",
        description: "Digite o telefone com DDD (10 ou 11 dígitos).",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          cellphone: `+55${customerData.cellphone.replace(/\D/g, '')}`,
          taxId: customerData.taxId
        })
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.paymentUrl, '_blank');
        
        toast({
          title: "PIX gerado",
          description: "Complete o pagamento via PIX na nova aba.",
        });
        
        setShowPixForm(false);
      } else {
        throw new Error(data.message || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar PIX",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePixQrCode = async () => {
if (!customerData.name || !customerData.email || !customerData.cellphone || !customerData.taxId) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(customerData.taxId)) {
      toast({
        title: "CPF inválido",
        description: "Digite apenas os números do CPF (11 dígitos).",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(customerData.cellphone.replace(/\D/g, ''))) {
      toast({
        title: "Telefone inválido",
        description: "Digite o telefone com DDD (10 ou 11 dígitos).",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/pix-qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          cellphone: `+55${customerData.cellphone.replace(/\D/g, '')}`,
          taxId: customerData.taxId,
          value: 990
        })
      });

      const data = await response.json();

      if (data.success) {
        setQrCodeData({
          qrCodeBase64: data.qrCodeBase64,
          qrCodeText: data.qrCodeText,
          paymentId: data.paymentId,
          amount: data.amount,
          expiresAt: data.expiresAt,
          paymentUrl: data.paymentUrl
        });
        
        setShowPixForm(false);
        setShowQrCode(true);
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code ou copie o código PIX para realizar o pagamento.",
        });
      } else {
        throw new Error(data.message || 'Erro ao gerar QR Code PIX');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code PIX:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar QR Code PIX",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(price / 100);
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return '/mês';
      case 'yearly': return '/ano';
      case 'forever': return '';
      default: return '';
    }
  };

  const isPlanActive = (planId: string) => {
    if (!isAuthenticated) return false; 
    if (planId === 'free' && !isPremium) return true;
    if (planId === 'premium' && isPremium) return true;
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Escolha seu Plano</h1>
        <p className="text-muted-foreground">
          Desbloqueie todo o potencial do QuizQuest
        </p>
        {isAuthenticated && isPremium && (
          <div className="mt-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-3 py-1">
              <Crown className="w-3 h-3 mr-1" />
              Você é Premium!
            </Badge>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.id === 'premium' 
                ? 'border-primary shadow-md scale-105' 
                : 'hover:scale-102'
            } ${
              isPlanActive(plan.id) 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
          >
            {plan.id === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              </div>
            )}

            {isPlanActive(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                {plan.id === 'premium' ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Zap className="w-6 h-6 text-blue-500" />
                )}
                {plan.name}
              </CardTitle>
              
              <div className="text-4xl font-bold">
                {formatPrice(plan.price, plan.currency)}
                <span className="text-lg font-normal text-muted-foreground">
                  {getFrequencyText(plan.frequency)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">✓ Recursos inclusos:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations && plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-orange-700">⚠ Limitações:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <span className="w-4 h-4 mr-2 flex-shrink-0">⚡</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4">
                {plan.id === 'free' ? (
                  <Button 
                    className="w-full" 
                    variant={isPlanActive(plan.id) ? "secondary" : "outline"}
                    disabled={isPlanActive(plan.id)}
                  >
                    {isPlanActive(plan.id) ? 'Plano Atual' : 'Gratuito'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading || isPlanActive(plan.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {loading && subscribingTo === plan.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </div>
                      ) : isPlanActive(plan.id) ? (
                        'Plano Atual'
                      ) : (
                        <>
                          <Infinity className="w-4 h-4 mr-2" />
                          {isAuthenticated ? 'Assinar Mensal' : 'Cadastre-se e Assine'}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handlePixPayment}
                      disabled={loading || isPlanActive(plan.id)}
                      variant="outline"
                      className="w-full border-green-600 text-green-700 hover:bg-green-50"
                    >
                      {isAuthenticated ? 'Pagamento único via PIX' : 'Cadastre-se e Pague via PIX'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>💳 Pagamentos processados com segurança pela AbacatePay</p>
        <p>🔄 Cancele sua assinatura a qualquer momento</p>
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">
              💡 Como funciona:
            </p>
            <p className="text-blue-700 text-sm">
              1. Escolha seu plano → 2. Crie sua conta → 3. Realize o pagamento → 4. Aproveite o premium!
            </p>
            <div className="mt-3 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/register')}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Criar Conta
              </Button>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => setLocation('/login')}
                className="text-blue-600"
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para dados do PIX */}
      <Dialog open={showPixForm} onOpenChange={setShowPixForm}>
  <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dados para Pagamento PIX</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="cellphone">Telefone *</Label>
              <Input
                id="cellphone"
                value={customerData.cellphone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, cellphone: e.target.value }))}
                placeholder="11999999999 (com DDD, apenas números)"
                maxLength={11}
              />
            </div>
            
            <div>
              <Label htmlFor="taxId">CPF *</Label>
              <Input
                id="taxId"
                value={customerData.taxId}
                onChange={(e) => setCustomerData(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="12345678900 (apenas números)"
                maxLength={11}
              />
            </div>
            
            <div className="space-y-3 pt-4">
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={processPixPayment}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Gerando...
                    </div>
                  ) : (
                    'Abrir Link PIX'
                  )}
                </Button>
                <Button
                  className="flex-1"
                  onClick={generatePixQrCode}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </div>
                  ) : (
                    'Gerar QR Code'
                  )}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowPixForm(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              * Campos obrigatórios. Seus dados são seguros e processados pela AbacatePay.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para exibir QR Code */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">QR Code PIX - QuizQuest Premium</DialogTitle>
          </DialogHeader>
          
          {qrCodeData && (
            <div className="space-y-3 text-center flex flex-col items-center">
              {qrCodeData.qrCodeBase64 ? (
                <div className="bg-white p-2 sm:p-4 rounded-lg border w-full flex justify-center">
                  <img 
                    src={qrCodeData.qrCodeBase64} 
                    alt="QR Code PIX" 
                    className="mx-auto rounded shadow-md max-h-64 object-contain"
                    style={{ 
                      maxWidth: 'min(90vw, 280px)', 
                      maxHeight: 'min(60vh, 280px)',
                      width: 'auto', 
                      height: 'auto' 
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-dashed border-green-300">
                  <div className="text-green-700 text-lg font-semibold mb-2">
                    💳 Pagamento PIX Gerado
                  </div>
                  <p className="text-green-600 text-sm">
                    Clique no link abaixo ou copie o código PIX para realizar o pagamento
                  </p>
                </div>
              )}
              
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium">Ou copie o código PIX:</p>
                <textarea
                  readOnly
                  value={qrCodeData.qrCodeText}
                  className="w-full h-16 sm:h-20 p-2 text-xs border rounded resize-none font-mono bg-gray-50"
                  onClick={(e) => e.currentTarget.select()}
                  style={{ fontSize: '0.75rem', lineHeight: '1.2' }}
                />
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Valor:</strong> R$ {(qrCodeData.amount / 100).toFixed(2)}</p>
                <p><strong>ID do Pagamento:</strong> {qrCodeData.paymentId}</p>
                {qrCodeData.expiresAt && (
                  <p><strong>Expira em:</strong> {new Date(qrCodeData.expiresAt).toLocaleString('pt-BR')}</p>
                )}
              </div>
              
              <div className="space-y-3">
                {qrCodeData.paymentUrl && (
                  <Button
                    onClick={() => window.open(qrCodeData.paymentUrl, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    🔗 Abrir Página de Pagamento
                  </Button>
                )}
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    📱 <strong>Como pagar:</strong><br />
                    1. {qrCodeData.qrCodeBase64 ? 'Escaneie o QR Code ou' : 'Copie o código PIX ou'} clique no botão acima<br />
                    2. Abra seu banco ou carteira digital<br />
                    3. Confirme o pagamento de R$ {(qrCodeData.amount / 100).toFixed(2)}<br />
                    4. Seu plano premium será ativado automaticamente!
                  </p>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={() => {
                  setShowQrCode(false);
                  setQrCodeData(null);
                }}
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}