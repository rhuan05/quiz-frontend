import { Button } from "../../components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";
import type { Option } from "../../../../../backend/shared/schema";

interface FeedbackModalProps {
  isCorrect: boolean;
  correctOption: Option;
  explanation: string;
  pointsEarned: number;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function FeedbackModal({
  isCorrect,
  correctOption,
  explanation,
  pointsEarned,
  onNext,
  isLastQuestion
}: FeedbackModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCorrect ? (
              <Check className="text-green-600 text-3xl" />
            ) : (
              <X className="text-red-600 text-3xl" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isCorrect ? "Correto! 🎉" : "Não foi dessa vez 😅"}
          </h3>
          
          {isCorrect ? (
            <p className="text-lg text-gray-600 mb-6">
              Você ganhou {pointsEarned} pontos
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-2">
                A resposta correta era: <strong className="text-primary">{correctOption.text}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Continue tentando, você está aprendendo!
              </p>
            </>
          )}
          
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              {isCorrect ? "Explicação:" : "Por que esta é a resposta correta:"}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {explanation}
            </p>
          </div>
          
          <Button 
            onClick={onNext}
            className="bg-primary text-white px-8 py-3 hover:bg-blue-600 transition-colors"
          >
            {isLastQuestion ? "Ver Resultados" : "Próxima Pergunta"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
