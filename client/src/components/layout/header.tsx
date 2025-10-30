import { Button } from "../../components/ui/button";
import { useLocation } from "wouter";
import { Code, LogIn, LogOut, Menu, X, Trophy, Crown, CreditCard, User } from "lucide-react";
import { useQuiz } from "../../hooks/use-quiz";
import { useAuth } from "../../contexts/auth-context";
import { useState } from 'react';
import { AuthModal } from "../auth/auth-modal";

const UserAvatar = ({ user }: { user: any }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!user.avatar || imageError) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
        <User className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
  
  return (
    <img
      src={user.avatar}
      alt={user.displayName || user.username || 'Usuário'}
      className="w-8 h-8 rounded-full object-cover border border-gray-200"
      onError={() => setImageError(true)}
    />
  );
};

export default function Header() {
  const [location, setLocation] = useLocation();
  const [authError, setAuthError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controle do menu hamburguer

  const { startQuiz, resetQuiz, isLoading } = useQuiz();
  const { isAuthenticated, user, logout } = useAuth();
  const [, setIsLoading] = useState(false);

  const handleStartQuiz = async () => {
    setAuthError('');
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoading(true);
      await startQuiz();
      setTimeout(() => setLocation('/quiz'), 10);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuth = async (_email: string, _password: string) => {
    try {      
      setAuthError('');
      const sessionToken = await startQuiz();
      if (!sessionToken) throw new Error("Sessão não foi criada corretamente");
      await new Promise(resolve => setTimeout(resolve, 50));
      setShowAuthModal(false);
      setLocation('/quiz');
    } catch (error: any) {
      setAuthError(error.message || 'Erro ao iniciar quiz');
    }
  };

  // Menu de botões de autenticação (desktop e mobile)
  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    isAuthenticated ? (
      <>
        {user?.role === "admin" && (
          <Button
            onClick={() => {
              setLocation("/admin");
              if (isMobile) setIsMenuOpen(false);
            }}
            className="bg-primary text-white hover:bg-blue-600 w-full"
          >
            Admin
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`text-gray-600 w-full hover:text-red-600 ${isMobile ? 'mt-2' : ''}`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </>
    ) : (
      <>
        <Button
          variant="ghost"
          onClick={() => {
            setLocation("/login");
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`text-gray-600 w-full hover:text-primary ${isMobile ? 'mt-2' : ''}`}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Entrar
        </Button>
        <Button
          onClick={() => {
            setLocation("/register");
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`bg-primary text-white w-full hover:bg-blue-600 ${isMobile ? 'mt-2' : ''}`}
        >
          Cadastrar
        </Button>
      </>
    )
  );

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
              }}
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
                onClick={() => setLocation("/ranking")}
                className="text-gray-600 hover:text-primary"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Ranking
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

              <div className="flex items-center space-x-4 ml-6 border-l border-gray-200 pl-6">
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={user} />
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName || user.username}
                    </span>
                  </div>
                )}
                <AuthButtons />
              </div>
            </nav>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {isMenuOpen && (
                <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md p-4 w-60 space-y-2 z-50">
                  {isAuthenticated && user && (
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 mb-3">
                      <UserAvatar user={user} />
                      <span className="text-sm font-medium text-gray-700">
                        {user.displayName || user.username}
                      </span>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setLocation("/ranking");
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-primary w-full"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Ranking
                  </Button>

                  {location !== "/quiz" && !location.includes("results") && (
                    <Button
                      onClick={() => {
                        handleStartQuiz();
                        setIsMenuOpen(false);
                      }}
                      className="bg-primary text-white w-full"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Começar Quiz
                    </Button>
                  )}
                  <AuthButtons isMobile />
                </div>
              )}
            </div>
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
