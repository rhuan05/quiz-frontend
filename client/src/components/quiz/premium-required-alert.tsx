import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Crown, Lock } from 'lucide-react';
import { useLocation } from 'wouter';

interface PremiumRequiredAlertProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function PremiumRequiredAlert({ 
  isOpen, 
  onClose, 
  message = "Para iniciar o quiz e começar a pontuar você deve ser um usuário Premium. Conclua seu cadastro finalizando o pagamento de R$ 19,90 e comece a aprender!" 
}: PremiumRequiredAlertProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleGoToPremium = () => {
    onClose();
    setLocation('/premium');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Premium Necessário</h3>
            <p className="text-sm text-gray-600">Acesso restrito a usuários premium</p>
          </div>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <Crown className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {message}
          </AlertDescription>
        </Alert>

        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleGoToPremium}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Crown className="mr-2 h-4 w-4" />
            Ir para Premium
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}