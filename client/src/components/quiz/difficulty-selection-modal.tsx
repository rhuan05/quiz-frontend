import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Target, TrendingUp, Award, Zap, AlertTriangle } from 'lucide-react';

interface Difficulty {
  id: string;
  name: string;
  label: string;
  points: number;
  color: string;
  order: number;
}

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

interface DifficultySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  difficulties: Difficulty[];
  onStartQuiz: (categoryId: string, difficultyId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function DifficultySelectionModal({
  isOpen,
  onClose,
  category,
  difficulties,
  onStartQuiz,
  loading = false,
  error = null
}: DifficultySelectionModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const getDifficultyIcon = (difficultyName: string) => {
    switch (difficultyName.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return <Target className="w-6 h-6" />;
      case 'médio':
      case 'medium':
        return <TrendingUp className="w-6 h-6" />;
      case 'difícil':
      case 'hard':
        return <Award className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getDifficultyDescription = (difficultyName: string) => {
    switch (difficultyName.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return 'Perguntas básicas e conceitos fundamentais';
      case 'médio':
      case 'medium':
        return 'Conhecimentos intermediários e aplicações práticas';
      case 'difícil':
      case 'hard':
        return 'Conceitos avançados e cenários complexos';
      default:
        return 'Nível de conhecimento variado';
    }
  };

  const handleStartQuiz = () => {
    if (category && selectedDifficulty) {
      onStartQuiz(category.id, selectedDifficulty);
    }
  };

  const handleReset = () => {
    setSelectedDifficulty('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category?.color || '#6B7280' }}
            >
              <span className="text-white font-bold text-lg">
                {category?.name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold">Escolha a Dificuldade</div>
              <div className="text-sm text-gray-500 font-normal">
                Categoria: {category?.name}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Exibir erro se houver */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 py-4">
          {difficulties
            .sort((a, b) => a.order - b.order)
            .map((difficulty) => (
            <Card
              key={difficulty.id}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                selectedDifficulty === difficulty.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setSelectedDifficulty(difficulty.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: difficulty.color }}
                    >
                      {getDifficultyIcon(difficulty.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {difficulty.label}
                        <Badge variant="outline" className="text-xs">
                          {difficulty.points} pts
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getDifficultyDescription(difficulty.name)}
                      </div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedDifficulty === difficulty.id
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedDifficulty === difficulty.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleStartQuiz}
            disabled={!selectedDifficulty || loading}
            className="bg-primary text-white hover:bg-blue-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Iniciando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Iniciar Quiz
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}