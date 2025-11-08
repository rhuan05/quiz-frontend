import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, ChevronRight, BookOpen, Target, Zap } from 'lucide-react';
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
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    
    if (selectedCategory && selectedTopic) {
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
    <div className="flex items-center justify-center space-x-2 mb-6">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        step === 'category' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <BookOpen className="w-4 h-4" />
        <span>Categoria</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        step === 'topic' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Target className="w-4 h-4" />
        <span>Tópico</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        step === 'difficulty' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Zap className="w-4 h-4" />
        <span>Dificuldade</span>
      </div>
    </div>
  );

  const renderCategoryStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Escolha uma Categoria</h3>
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              {category.icon && <span className="text-2xl">{category.icon}</span>}
              <div>
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
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
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha um Tópico</h3>
        <p className="text-sm text-gray-600 mt-1">
          Categoria: <span className="font-medium">{selectedCategory?.name}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {selectedCategory?.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicSelect(topic)}
            className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center space-x-3">
              {topic.icon && <span className="text-2xl">{topic.icon}</span>}
              <div>
                <h4 className="font-medium text-gray-900">{topic.name}</h4>
                {topic.description && (
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDifficultyStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha a Dificuldade</h3>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">{selectedCategory?.name}</span> → 
          <span className="font-medium"> {selectedTopic?.name}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.id}
            onClick={() => handleDifficultySelect(difficulty)}
            className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getDifficultyIcon(difficulty.name)}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{difficulty.label}</h4>
                  <p className="text-sm text-gray-600">{difficulty.points} pontos por acerto</p>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Configurar Quiz</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {step === 'category' && renderCategoryStep()}
            {step === 'topic' && renderTopicStep()}
            {step === 'difficulty' && renderDifficultyStep()}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step !== 'category' && (
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="ml-auto">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}