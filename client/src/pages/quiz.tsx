import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuiz } from "../hooks/use-quiz";
import QuestionCard from "../components/quiz/question-card";
import ProgressBar from "../components/quiz/progress-bar";
import Timer from "../components/quiz/timer";
import FeedbackModal from "../components/quiz/feedback-modal";
import { FreeLimitModal } from "../components/quiz/free-limit-modal";
import LoadingOverlay from "../components/layout/loading-overlay";
import { Card, CardContent } from "../components/ui/card";
import { Trophy } from "lucide-react";
import { API_BASE_URL } from '../../../config.json';

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { 
    currentQuestionIndex, 
    questions, 
    sessionToken, 
    score, 
    showFeedback, 
    feedbackData,
    submitAnswer,
    nextQuestion,
    completeQuiz,
    setShowFeedback
  } = useQuiz();

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFreeLimitModal, setShowFreeLimitModal] = useState(false);
  const [userRanking, setUserRanking] = useState<number | undefined>(undefined);
  const [userPoints, setUserPoints] = useState<number | undefined>(undefined);

  // Redirect if no session
  useEffect(() => {
    if (!sessionToken) {
      setLocation("/");
    }
  }, [sessionToken, setLocation]);

  // Reset selected option when question changes
  useEffect(() => {
    setSelectedOption("");
    setTimeSpent(0);
  }, [currentQuestionIndex]);

  // Timer for current question
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !questions[currentQuestionIndex]) return;
    
    setIsSubmitting(true);
    try {
      await submitAnswer(questions[currentQuestionIndex].id, selectedOption, timeSpent);
    } catch (error: any) {
      console.error("Failed to submit answer:", error);
      
      if (error.message === 'FREE_LIMIT_REACHED' || error.message?.includes('FREE_LIMIT_REACHED')) {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/ranking`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.ok) {
              const data = await response.json();
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              
              const currentUserId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub || tokenPayload.user?.id;
              
              const userIndex = data.findIndex((u: any) => u.id === currentUserId);
              
              if (userIndex !== -1) {
                const ranking = userIndex + 1;
                const points = data[userIndex].totalScore || 0;
                
                setUserRanking(ranking);
                setUserPoints(points);
              } else {
                console.log('❌ Quiz - Usuário não encontrado no ranking');
              }
            } else {
              console.log('❌ Quiz - Erro ao buscar ranking:', response.status);
            }
          } catch (err) {
            console.error('❌ Quiz - Erro ao buscar ranking:', err);
          }
        }
        
        setTimeout(() => {
          setShowFreeLimitModal(true);
        }, 150);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex >= questions.length - 1) {
      // Quiz complete
      try {
        await completeQuiz(timeSpent);
        setLocation(`/results/${sessionToken}`);
      } catch (error) {
        console.error("Failed to complete quiz:", error);
      }
    } else {
      nextQuestion();
    }
    setShowFeedback(false);
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!sessionToken || questions.length === 0) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quiz Header with Progress */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Quiz JavaScript</h2>
                    <p className="text-sm text-gray-500">
                      Pergunta {currentQuestionIndex + 1} de {questions.length}
                    </p>
                  </div>
                </div>
                
                {/* Timer and Score */}
                <div className="flex items-center space-x-6">
                  <Timer timeSpent={timeSpent} />
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Pontuação</div>
                    <div className="font-semibold text-primary flex items-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      {Math.round(score)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <ProgressBar 
                current={currentQuestionIndex + 1} 
                total={questions.length} 
              />
            </CardContent>
          </Card>

          {/* Question Card */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              onSubmit={handleSubmitAnswer}
              onSkip={handleSkipQuestion}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && feedbackData && (
        <FeedbackModal
          isCorrect={feedbackData.isCorrect}
          correctOption={feedbackData.correctOption}
          explanation={feedbackData.explanation}
          pointsEarned={feedbackData.pointsEarned || 0}
          onNext={handleNextQuestion}
          isLastQuestion={currentQuestionIndex >= questions.length - 1}
        />
      )}

      {/* Free Limit Reached Modal */}
      <FreeLimitModal
        isOpen={showFreeLimitModal}
        onClose={() => {
          setShowFreeLimitModal(false);
          setLocation('/');
        }}
        userRanking={userRanking}
        userPoints={userPoints}
      />
    </>
  );
}
