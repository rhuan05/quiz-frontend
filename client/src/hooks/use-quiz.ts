import { useQuizContext } from "@/contexts/quiz-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useQuiz() {
  const { state, dispatch } = useQuizContext();

  const startQuizMutation = useMutation({
    mutationFn: async (category?: string) => {
      // Start session with category
      const sessionResponse = await apiRequest("POST", "/api/quiz/start", {
        category: category || 'JavaScript'
      });
      const sessionData = await sessionResponse.json();
      
      return { 
        sessionToken: sessionData.sessionToken, 
        questions: sessionData.questions 
      };
    },
    onSuccess: (data) => {
      dispatch({ 
        type: 'START_QUIZ', 
        payload: { 
          sessionToken: data.sessionToken, 
          questions: data.questions 
        } 
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, optionId, timeSpent }: { 
      questionId: string; 
      optionId: string; 
      timeSpent: number; 
    }) => {
      const response = await apiRequest("POST", "/api/quiz/answer", {
        sessionToken: state.sessionToken,
        questionId,
        optionId,
        timeSpent,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      dispatch({
        type: 'SUBMIT_ANSWER',
        payload: {
          questionId: variables.questionId,
          optionId: variables.optionId,
          isCorrect: data.isCorrect,
          timeSpent: variables.timeSpent,
          feedbackData: data,
        },
      });
    },
  });

  const completeQuizMutation = useMutation({
    mutationFn: async (timeSpent: number) => {
      const response = await apiRequest("POST", "/api/quiz/complete", {
        sessionToken: state.sessionToken,
        timeSpent,
      });
      return response.json();
    },
  });

  const startQuiz = async (category?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await startQuizMutation.mutateAsync(category);
    return result.sessionToken;
  };

  const submitAnswer = async (questionId: string, optionId: string, timeSpent: number) => {
    return submitAnswerMutation.mutateAsync({ questionId, optionId, timeSpent });
  };

  const completeQuiz = async (timeSpent: number) => {
    return completeQuizMutation.mutateAsync(timeSpent);
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const setShowFeedback = (show: boolean, data?: any) => {
    dispatch({ type: 'SET_FEEDBACK', payload: { show, data } });
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  return {
    ...state,
    startQuiz,
    submitAnswer,
    completeQuiz,
    nextQuestion,
    setShowFeedback,
    resetQuiz,
    isLoading: state.isLoading || startQuizMutation.isPending,
  };
}
