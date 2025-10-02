import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import ShareModal from "../components/quiz/share-modal";
import LoadingOverlay from "../components/layout/loading-overlay";
import { useState } from "react";
import { Trophy, RotateCcw, Share, BarChart3, Medal, Clock } from "lucide-react";
import { useQuiz } from "../hooks/use-quiz";

export default function Results() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [showShareModal, setShowShareModal] = useState(false);
  
  const sessionToken = params.sessionToken;

  const { data: results, isLoading, error } = useQuery({
    queryKey: ["/api/quiz/results", sessionToken],
    enabled: !!sessionToken,
  });

  const { resetQuiz } = useQuiz();

  const handleRestartQuiz = () => {
    resetQuiz();
    setLocation("/");
  };

  const handleViewAnalysis = () => {
    // TODO: Implement detailed analysis page
    alert("Análise detalhada será implementada na próxima versão.");
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Erro ao carregar resultados</h2>
            <p className="text-gray-600 mb-6">Não foi possível carregar os resultados do quiz.</p>
            <Button onClick={handleRestartQuiz}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, performanceLevel, averageTime, categoryBreakdown } = results;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Avançado': return 'text-green-600';
      case 'Intermediário': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  const getPerformanceIcon = (level: string) => {
    switch (level) {
      case 'Avançado': return <Trophy className="h-6 w-6" />;
      case 'Intermediário': return <Medal className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  return (
    <>
      <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quiz Concluído!</h2>
            <p className="text-xl text-gray-600">Confira seu desempenho e áreas de melhoria</p>
          </div>
          
          {/* Score Card */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold text-primary mb-2">{Math.round(session.score)}%</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">Pontuação Final</div>
                  <div className="text-sm text-gray-500">{session.correctAnswers} de {session.totalQuestions} pontos</div>
                </div>
                
                <div>
                  <div className="text-5xl font-bold text-green-600 mb-2">{session.correctAnswers}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">Acertos</div>
                  <div className="text-sm text-gray-500">de {session.totalQuestions} perguntas</div>
                </div>
                
                <div>
                  <div className="text-5xl font-bold text-orange-600 mb-2">{formatTime(Math.round(averageTime))}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">Tempo Médio</div>
                  <div className="text-sm text-gray-500">por pergunta</div>
                </div>
              </div>
              
              {/* Performance Badge */}
              <div className="text-center mt-8 pt-8 border-t border-gray-200">
                <div className={`inline-flex items-center ${getPerformanceColor(performanceLevel)} bg-gray-50 px-6 py-3 rounded-full text-lg font-semibold`}>
                  {getPerformanceIcon(performanceLevel)}
                  <span className="ml-3">Nível {performanceLevel}</span>
                </div>
                <p className="text-gray-600 mt-3">
                  {performanceLevel === 'Avançado' && "Excelente! Você demonstra domínio avançado dos conceitos JavaScript."}
                  {performanceLevel === 'Intermediário' && "Bom trabalho! Você demonstra conhecimento sólido dos fundamentos do JavaScript."}
                  {performanceLevel === 'Iniciante' && "Continue estudando! Há muito potencial para crescimento nos conceitos básicos."}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Breakdown */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="text-primary mr-3" />
                  Análise por Categoria
                </h3>
                {Object.entries(categoryBreakdown).map(([category, stats]) => {
                  const { correct, total, percentage } = stats as {
                    correct: number;
                    total: number;
                    percentage: number;
                  };

                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-700">{category}</span>
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 rounded-full h-2 w-24">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {correct}/{total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            
            {/* Study Recommendations */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Medal className="text-orange-600 mr-3" />
                  Recomendações de Estudo
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => {
                      const statA = a as { percentage: number };
                      const statB = b as { percentage: number };
                      return statA.percentage - statB.percentage;
                    })
                    .slice(0, 3)
                    .map(([category, stats]) => {
                      const { percentage } = stats as {
                        correct: number;
                        total: number;
                        percentage: number;
                      };

                    const level =
                      percentage >= 80 ? "success" :
                      percentage >= 60 ? "warning" : "error";

                    const color =
                      level === "success" ? "bg-green-600" :
                      level === "warning" ? "bg-orange-600" : "bg-red-600";
                      
                    return (
                      <div key={category} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${color} rounded-full mt-2 flex-shrink-0`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{category}</h4>
                          <p className="text-sm text-gray-600">
                            {level === 'success' && "Você demonstra bom entendimento desta área!"}
                            {level === 'warning' && "Revise alguns conceitos para melhorar sua compreensão"}
                            {level === 'error' && "Foque seus estudos nesta área para melhor desempenho"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleRestartQuiz}
              className="flex-1 max-w-xs bg-primary text-white px-8 py-4 font-semibold hover:bg-blue-600 transition-colors shadow-lg"
            >
              <RotateCcw className="mr-3 h-5 w-5" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => setShowShareModal(true)}
              className="flex-1 max-w-xs bg-green-600 text-white px-8 py-4 font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              <Share className="mr-3 h-5 w-5" />
              Compartilhar Resultado
            </Button>
            
            <Button 
              onClick={handleViewAnalysis}
              variant="secondary"
              className="flex-1 max-w-xs px-8 py-4 font-semibold transition-colors shadow-lg"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Análise Detalhada
            </Button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          score={Math.round(session.score)}
          performanceLevel={performanceLevel}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
