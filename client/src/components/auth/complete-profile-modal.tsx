import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data?: { username?: string; phone?: string }) => void;
  email: string;
  needsPhone?: boolean;
  needsUsername?: boolean;
  customSubmit?: (data: { username?: string; phone?: string }) => Promise<void>;
}

export function CompleteProfileModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  email, 
  needsPhone, 
  needsUsername,
  customSubmit 
}: CompleteProfileModalProps) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { completeGoogleAuth } = useAuth();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9._]/g, '')
      .toLowerCase();
    setUsername(formattedValue);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validateForm = () => {
    if (needsUsername && !username.trim()) {
      setError('Nome de usuário é obrigatório');
      return false;
    }

    if (needsUsername && username.length < 3) {
      setError('Nome de usuário deve ter pelo menos 3 caracteres');
      return false;
    }

    if (needsPhone && !phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    if (needsPhone && phone.replace(/\D/g, '').length !== 11) {
      setError('Telefone deve ter 11 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const profileData = {
        ...(needsUsername && { username }),
        ...(needsPhone && { phone }),
      };

      if (customSubmit) {
        await customSubmit(profileData);
      } else {
        await completeGoogleAuth({
          email,
          ...profileData,
        });
      }

      onComplete(profileData);
      onClose();
    } catch (error: any) {
      console.error('Complete profile error:', error);
      setError(error.message || 'Erro ao completar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Complete seu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mb-4">
          Para completar seu cadastro, precisamos de algumas informações adicionais:
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Campo Email (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email-display">Email</Label>
            <Input
              id="email-display"
              type="email"
              value={email}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Campo Username se necessário */}
          {needsUsername && (
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário *</Label>
              <Input
                id="username"
                type="text"
                placeholder="ex: joaosilva123"
                value={username}
                onChange={handleUsernameChange}
                disabled={isLoading}
                className="w-full font-mono"
              />
              <p className="text-xs text-gray-500">
                Mínimo 3 caracteres. Apenas letras, números, pontos e underscores. Sem espaços.
              </p>
            </div>
          )}

          {/* Campo Telefone se necessário */}
          {needsPhone && (
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className="pl-10 w-full"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-gray-500">
                Formato: (XX) XXXXX-XXXX
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Completar Cadastro'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}