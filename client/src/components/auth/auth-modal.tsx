import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { apiRequest } from '../../lib/queryClient';
import { useQuiz } from '../../hooks/use-quiz';
import { useLocation } from 'wouter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (username: string, email: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

export function AuthModal({ isOpen, onClose, onAuth, loading, error }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formErrors, setFormErrors] = useState<{username?: string, email?: string; password?: string}>({});
  const { login } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { startQuiz, isLoadingQuiz, state } = useQuiz();
  const [, setLocation] = useLocation();

  const validateForm = () => {
    const newErrors: {username?: string, email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      try {
        setIsLoading(true);
        setMessage(null);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          await login(email, password);
        }

        setIsLoading(true);
        await startQuiz();
        await setTimeout(() => {
          onClose();
          setLocation('/quiz');
        }, 10);
      } catch (error: any) {
        setMessage(error.message || "Erro desconhecido.");

        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    } else {
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
            // Redirect to login after 2 seconds
            setTimeout(() => {
              setIsLogin(!isLogin);
            }, 2000);
        }
      } catch (error: any) {
          setMessage(error.message || "Erro desconhecido.");
          setIsSuccess(false);
      } finally {
          setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setPassword('');
      setUsername('');
      setFormErrors({});
      setShowPassword(false);
      setIsLogin(true);
      onClose();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    setMessage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {isLogin ? 'Faça seu Login' : 'Criar Nova Conta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mostrar erro global se houver */}
          {message && (
            <Alert variant={isSuccess ? "default" : "destructive"}
                  className={isSuccess ? 'border-green-500 bg-green-50 text-green-800' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Campo Nome de Usuário */}
          { !isLogin ? <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Digite seu nome de usuário"
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={formErrors.username ? 'border-red-500 focus:border-red-500' : ''}
              />
          </div> : <></>}

          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={formErrors.email ? 'border-red-500 focus:border-red-500' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={formErrors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>
          
          {isLogin ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Entre com suas credenciais para acessar seu histórico</p>
              <p>• Seus resultados anteriores serão carregados</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Crie uma conta para salvar seu progresso</p>
              <p>• Senha deve ter pelo menos 6 caracteres</p>
              <p>• Seus resultados ficarão salvos para sempre</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar e Começar Quiz' : 'Criar Conta e Começar Quiz'
              )}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Fazer login'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}