import { Button } from "../../components/ui/button";
import { useLocation } from "wouter";
import { Code, Home, BarChart3, LogIn, LogOut, User } from "lucide-react";
import { useQuiz } from "../../hooks/use-quiz";
import { useAuth } from "../../contexts/auth-context";
import { useState } from 'react';
import { AuthModal } from "../auth/auth-modal";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [authError, setAuthError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { startQuiz, resetQuiz, isLoading } = useQuiz();
  const { isAuthenticated, user, logout } = useAuth();
  const [, setIsLoading] = useState(false);

  const handleStartQuiz = async () => {
    setAuthError('');

    const token = localStorage.getItem("authToken");

    if (token) {
      setIsLoading(true);
        await startQuiz();
        setTimeout(() => {
          setLocation('/quiz');
        }, 10)
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuth = async (email: string, password: string) => {
    try {      
      setAuthError('');
      
      const sessionToken = await startQuiz(email, password, 'javascript', 'easy');
      
      if (!sessionToken) {
        throw new Error("Sessão não foi criada corretamente");
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));

      setShowAuthModal(false);
      setLocation('/quiz');
      
    } catch (error: any) {
      setAuthError(error.message || 'Erro ao iniciar quiz');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                  resetQuiz();
                  setLocation("/");
                }
              }
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Code className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quizzes</h1>
                <p className="text-sm text-gray-500">Tecnologia</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  resetQuiz();
                  setLocation("/");
                }
              }
                className={location === "/" ? "text-primary" : "text-gray-600"}
              >
                <Home className="mr-2 h-4 w-4" />
                Início
              </Button>
              
              {location !== "/quiz" && !location.includes("results") && (
                <Button
                  onClick={handleStartQuiz}
                  className="bg-primary text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Começar Quiz
                </Button>
              )}

              {/* Auth buttons */}
              <div className="flex items-center space-x-4 ml-6 border-l border-gray-200 pl-6">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{user?.username}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setLocation("/login")}
                      className="text-gray-600 hover:text-primary"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setLocation("/register")}
                      className="bg-primary text-white hover:bg-blue-600"
                    >
                      Cadastrar
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => {
                setShowAuthModal(false);
                setAuthError('');
              }}
              onAuth={handleAuth}
              loading={isLoading}
              error={authError}
            />
    </>
  );
}
