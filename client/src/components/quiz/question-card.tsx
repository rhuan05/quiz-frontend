import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SkipForward } from "lucide-react";
import type { QuestionWithOptions } from "../../types/quiz";

interface QuestionCardProps {
  question: QuestionWithOptions;
  selectedOption: string;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export default function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  onSubmit,
  onSkip,
  isSubmitting
}: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <Card className="shadow-sm">
      <CardContent className="p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Badge className="bg-primary/10 text-primary">
              {question.category?.name || 'Geral'}
            </Badge>
            <Badge className={getDifficultyColor(question.difficulty?.label || 'medium')}>
              {question.difficulty?.label || 'Médio'}
            </Badge>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {question.question}
          </h3>

          {/* Code Block */}
          {question.code && (
            <div className="code-block rounded-lg p-6 mb-6 bg-gradient-to-r from-slate-800 to-slate-700">
              <pre className="font-mono text-sm text-gray-100 overflow-x-auto">
                <code>{question.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
            const label = optionLabels[index];
            const isSelected = selectedOption === option.id;

            return (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                  }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelectOption(option.id)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 border-2 rounded-full mr-4 flex items-center justify-center transition-colors ${isSelected
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                  }`}>
                  {isSelected && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {label} {option.text}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between mt-6">
          {/* Responder em cima no mobile */}
          <Button
            onClick={onSubmit}
            disabled={!selectedOption || isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white hover:bg-blue-600 order-1 sm:order-none"
          >
            {isSubmitting ? "Enviando..." : "Responder"}
          </Button>

          {/* Pular e Dica juntos abaixo no mobile */}
          <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto order-2 sm:order-none">
            <Button
              variant="outline"
              onClick={onSkip}
              className="w-full sm:w-auto px-6 py-3"
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Pular
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
