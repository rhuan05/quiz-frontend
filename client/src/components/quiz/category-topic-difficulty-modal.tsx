import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, ChevronRight, BookOpen, Target, Zap } from 'lucide-react';
import { PremiumRequiredAlert } from './premium-required-alert';
import { usePremiumCheck } from '../../hooks/use-premium-check';
import { API_BASE_URL } from '../../../../config.json';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  categoryId: string;
}

interface Difficulty {
  id: string;
  name: string;
  label: string;
  points: number;
  color?: string;
  order: number;
}

interface CategoryTopicDifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionComplete: (categoryId: string, topicId: string, difficultyId: string) => void;
  selectedCategory?: Category | null;
}

export function CategoryTopicDifficultyModal({
  isOpen,
  onClose,
  onSelectionComplete,
  selectedCategory: preSelectedCategory
}: CategoryTopicDifficultyModalProps) {
  const [step, setStep] = useState<'category' | 'topic' | 'difficulty'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [premiumAlertMessage, setPremiumAlertMessage] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { checkPremiumAccess } = usePremiumCheck();

  useEffect(() => {
    if (isOpen) {
      if (preSelectedCategory) {
        setSelectedCategory(preSelectedCategory);
        setStep('topic');
      } else {
        setStep('category');
        setSelectedCategory(null);
      }
      setSelectedTopic(null);
      setSelectedDifficulty(null);
      setError(null);
      loadCategories();
      loadDifficulties();
    }
  }, [isOpen, preSelectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }
      
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const loadDifficulties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/difficulties`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dificuldades');
      }
      
      const data = await response.json();
      setDifficulties(data.sort((a: Difficulty, b: Difficulty) => a.order - b.order));
    } catch (error) {
      console.error('Error loading difficulties:', error);
      setError('Erro ao carregar dificuldades');
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('topic');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setStep('difficulty');
  };

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    
    if (selectedCategory && selectedTopic) {
      const accessCheck = await checkPremiumAccess();
      
      if (!accessCheck.hasAccess) {
        if (accessCheck.needsPremium) {
          setPremiumAlertMessage(accessCheck.message || 'Premium necessário');
          setShowPremiumAlert(true);
        }
        return;
      }
      
      onSelectionComplete(selectedCategory.id, selectedTopic.id, difficulty.id);
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'topic') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'difficulty') {
      setStep('topic');
      setSelectedDifficulty(null);
    }
  };

  const getDifficultyIcon = (difficultyName: string) => {
    switch (difficultyName.toLowerCase()) {
      case 'easy':
      case 'fácil':
        return '🟢';
      case 'medium':
      case 'médio':
        return '🟡';
      case 'hard':
      case 'difícil':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
      <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
        step === 'category' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Categoria</span>
        <span className="sm:hidden">Cat.</span>
      </div>
      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
      <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
        step === 'topic' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Target className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Tópico</span>
        <span className="sm:hidden">Tóp.</span>
      </div>
      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
      <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
        step === 'difficulty' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Dificuldade</span>
        <span className="sm:hidden">Dif.</span>
      </div>
    </div>
  );

  const renderCategoryStep = () => (
    <div className="space-y-4 w-full">
      <h3 className="text-lg font-semibold text-center">Escolha uma Categoria</h3>
      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto w-full">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className="p-3 sm:p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              {category.icon && <span className="text-xl sm:text-2xl">{category.icon}</span>}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{category.name}</h4>
                {category.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{category.description}</p>
                )}
                <p className="text-xs text-blue-600 mt-2">
                  {category.topics.length} tópicos disponíveis
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTopicStep = () => (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha um Tópico</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Categoria: <span className="font-medium">{selectedCategory?.name}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto w-full">
        {selectedCategory?.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicSelect(topic)}
            className="p-3 sm:p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              {topic.icon && <span className="text-xl sm:text-2xl">{topic.icon}</span>}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{topic.name}</h4>
                {topic.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{topic.description}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDifficultyStep = () => (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha a Dificuldade</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          <span className="font-medium">{selectedCategory?.name}</span> → 
          <span className="font-medium"> {selectedTopic?.name}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 w-full">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.id}
            onClick={() => handleDifficultySelect(difficulty)}
            className="p-3 sm:p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">{getDifficultyIcon(difficulty.name)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{difficulty.label}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{difficulty.points} pontos por acerto</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100vw-2rem)] max-w-[400px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">Configurar Quiz</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive" className="mb-4 mx-auto max-w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8 flex-1">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
            {step === 'category' && renderCategoryStep()}
            {step === 'topic' && renderTopicStep()}
            {step === 'difficulty' && renderDifficultyStep()}
          </div>
        )}

        <div className="flex justify-between pt-4 gap-2 mt-auto">
          {step !== 'category' && (
            <Button variant="outline" onClick={handleBack} className="text-sm">
              Voltar
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="ml-auto text-sm">
            Cancelar
          </Button>
        </div>
        
        {/* Premium Required Alert */}
        <PremiumRequiredAlert 
          isOpen={showPremiumAlert}
          onClose={() => setShowPremiumAlert(false)}
          message={premiumAlertMessage}
        />
      </DialogContent>
    </Dialog>
  );
}