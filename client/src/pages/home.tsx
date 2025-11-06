import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import LoadingOverlay from "../components/layout/loading-overlay";
import { AuthModal } from "../components/auth/auth-modal";
import { DifficultySelectionModal } from "../components/quiz/difficulty-selection-modal";
import { Rocket, Zap, TrendingUp, Smartphone, Code, Calendar, Lock, Check } from "lucide-react";
import { useQuiz } from "../hooks/use-quiz";
import { useQuizContext } from "../contexts/quiz-context";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../../../config.json';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  availableFrom: Date | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Difficulty {
  id: string;
  name: string;
  label: string;
  points: number;
  color: string;
  order: number;
}

export default function Home() {
  const { startQuiz, isLoading } = useQuiz();
  const { state: quizState, dispatch: quizDispatch } = useQuizContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [, setLocation] = useLocation();
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchDifficulties();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Erro ao buscar categorias:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchDifficulties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/difficulties`);
      if (response.ok) {
        const data = await response.json();
        setDifficulties(data);
      } else {
        setDifficulties([
          { id: '379740f7-49ed-46e4-85e8-b655fce8fc7d', name: 'easy', label: 'Fácil', points: 10, color: '#22c55e', order: 1 },
          { id: 'e15122fe-0d1b-485d-94ea-c95bc479ad30', name: 'medium', label: 'Médio', points: 20, color: '#f59e0b', order: 2 },
          { id: '38ae9e44-2beb-4ef9-b160-cf5e2c5cf3bd', name: 'hard', label: 'Difícil', points: 30, color: '#ef4444', order: 3 }
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar dificuldades:', error);
      setDifficulties([
        { id: '379740f7-49ed-46e4-85e8-b655fce8fc7d', name: 'easy', label: 'Fácil', points: 10, color: '#22c55e', order: 1 },
        { id: 'e15122fe-0d1b-485d-94ea-c95bc479ad30', name: 'medium', label: 'Médio', points: 20, color: '#f59e0b', order: 2 },
        { id: '38ae9e44-2beb-4ef9-b160-cf5e2c5cf3bd', name: 'hard', label: 'Difícil', points: 30, color: '#ef4444', order: 3 }
      ]);
    }
  };

  const getCategoryStatus = (category: Category) => {
    const now = new Date();
    const availableFrom = category.availableFrom ? new Date(category.availableFrom) : null;

    if (!category.isActive) return 'inactive';
    if (!availableFrom) return 'available'; // Sem data = sempre disponível
    if (now >= availableFrom) return 'available'; // Data passou = disponível
    return 'coming-soon'; // Data não chegou = em breve
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleCategorySelect = (category: Category) => {
    console.log('Categoria selecionada:', category);
    
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedCategory(category);
    setShowDifficultyModal(true);
  };

  const handleStartQuizWithDifficulty = async (categoryId: string, difficultyId: string) => {
    try {      
      quizDispatch({ type: 'SET_ERROR', payload: null });
      
      const sessionToken = await startQuiz(categoryId, difficultyId);
            
      if (sessionToken) {
        console.log('✅ Quiz iniciado com sucesso, redirecionando...');
        
        setShowDifficultyModal(false);
        setSelectedCategory(null);
        
        setTimeout(() => {
          setLocation('/quiz');
        }, 100);
      } else {
        console.error('❌ Sessão não foi criada corretamente');
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar quiz:', error);
    }
  };



  const handleStartQuiz = async () => {
    setAuthError('');

    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        await startQuiz("JavaScript"); // Categoria padrão
        setTimeout(() => {
          setLocation('/quiz');
        }, 10)
      } catch (error) {
        console.error('Erro ao iniciar quiz:', error);
      }
    } else {
      setShowAuthModal(true);
    }

  };

  const handleAuth = async (_email: string, _password: string) => {
    try {
      setAuthError(''); // Limpar erros anteriores

      const sessionToken = await startQuiz("JavaScript"); // Categoria padrão

      if (!sessionToken) {
        throw new Error("Sessão não foi criada corretamente");
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      // Fechar modal
      setShowAuthModal(false);

      setLocation('/quiz');

    } catch (error: any) {
      setAuthError(error.message || 'Erro ao iniciar quiz');
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl font-mono text-primary transform rotate-12">{"{}"}</div>
          <div className="absolute top-40 right-20 text-4xl font-mono text-green-600 transform -rotate-12">[]</div>
          <div className="absolute bottom-32 left-20 text-5xl font-mono text-orange-600 transform rotate-45">()</div>
          <div className="absolute bottom-20 right-10 text-3xl font-mono text-red-600 transform -rotate-6">;</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Teste seus conhecimentos em
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"> Tecnologia</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubra suas habilidades com perguntas desafiadoras sobre desenvolvimento web, programação e tecnologias modernas.
              Receba feedback imediato e aprenda com explicações detalhadas.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">10</div>
                  <div className="text-gray-600">Perguntas Selecionadas</div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">15min</div>
                  <div className="text-gray-600">Tempo Estimado</div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                  <div className="text-gray-600">Níveis de Dificuldade</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Rocket className="mr-3 h-5 w-5" />
                Quiz Misto
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <Code className="mr-3 h-5 w-5" />
                Explorar Categorias
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Escolha sua Especialidade</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Foque seus estudos em tecnologias específicas ou teste conhecimentos gerais
            </p>
          </div>

          {loadingCategories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando categorias...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma categoria encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
              const status = getCategoryStatus(category);
              const isAvailable = status === 'available';
              const isComingSoon = status === 'coming-soon';

              return (
                <Card
                  key={category.id}
                  className={`group transition-all duration-300 border-0 bg-white relative overflow-hidden ${isAvailable
                      ? 'hover:shadow-lg cursor-pointer'
                      : 'opacity-75 cursor-not-allowed'
                    }`}
                  onClick={() => isAvailable && handleCategorySelect(category)}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {isAvailable && (
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Disponível
                      </Badge>
                    )}
                    {isComingSoon && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        Em breve
                      </Badge>
                    )}
                    {status === 'inactive' && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500">
                        <Lock className="w-3 h-3 mr-1" />
                        Bloqueado
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      >
                        <span className="text-white text-lg font-bold">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Ordem: {category.order}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {category.description}
                    </p>

                    {isComingSoon && category.availableFrom && (
                      <div className="text-sm text-gray-600 mb-3">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Disponível a partir de {formatDate(category.availableFrom)}
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full transition-all duration-300"
                      disabled={!isAvailable}
                      variant={isAvailable ? "default" : "outline"}
                    >
                      {isAvailable && "Iniciar Estudos"}
                      {isComingSoon && "Em Breve"}
                      {status === 'inactive' && (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Bloqueado
                        </>
                      )}
                    </Button>
                  </CardContent>

                  {/* Overlay para categorias não disponíveis */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
                  )}
                </Card>
              );
            })}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">Não encontrou sua tecnologia favorita?</p>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
              Sugerir Nova Categoria
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que usar nosso Quiz?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma experiência gamificada para evoluir suas habilidades em tecnologia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Feedback Imediato</h4>
              <p className="text-gray-600">Receba explicações detalhadas após cada resposta para acelerar seu aprendizado</p>
            </div>

            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600 text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Análise de Performance</h4>
              <p className="text-gray-600">Acompanhe seu progresso e identifique áreas que precisam de mais atenção</p>
            </div>

            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-orange-600 text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Totalmente Responsivo</h4>
              <p className="text-gray-600">Estude em qualquer dispositivo, com interface otimizada para mobile</p>
            </div>
          </div>
        </div>
      </section>

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

      {/* Difficulty Selection Modal */}
      <DifficultySelectionModal
        isOpen={showDifficultyModal}
        onClose={() => {
          setShowDifficultyModal(false);
          setSelectedCategory(null);
          quizDispatch({ type: 'SET_ERROR', payload: null });
        }}
        category={selectedCategory}
        difficulties={difficulties}
        onStartQuiz={handleStartQuizWithDifficulty}
        loading={isLoading}
        error={quizState.error}
      />
    </>
  );
}
