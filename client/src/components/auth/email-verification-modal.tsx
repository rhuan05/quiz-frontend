import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
  userData?: any;
}

export function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  onVerified, 
  email,
  userData 
}: EmailVerificationModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { verifyEmail, sendVerificationEmailWithUserData } = useAuth();
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (numbers.length === 6) {
      const newCode = numbers.split('');
      setCode(newCode);
      handleVerifyCode(numbers);
    }
  };

  const handleVerifyCode = async (codeString: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyEmail(email, codeString);
      setSuccess('Email verificado com sucesso!');
      
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Verify email error:', error);
      setError(error.message || 'Código inválido ou expirado');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (userData) {
        await sendVerificationEmailWithUserData(email, userData);
      } else {
        setError('Dados do usuário não encontrados. Faça o cadastro novamente.');
        return;
      }
      
      setSuccess('Código reenviado com sucesso!');
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
    } catch (error: any) {
      console.error('Resend email error:', error);
      setError(error.message || 'Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    handleVerifyCode(codeString);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Verificar Email
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mb-4 text-center">
          Enviamos um código de 6 dígitos para:
          <div className="font-semibold text-gray-800 mt-1">{email}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Campos do código */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading || isResending}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
          </div>

          <div className="text-center text-sm text-gray-500">
            Digite o código de 6 dígitos recebido por email
          </div>

          {/* Botões */}
          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                    Reenviando...
                  </>
                ) : countdown > 0 ? (
                  `Reenviar código em ${countdown}s`
                ) : (
                  'Reenviar código'
                )}
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}