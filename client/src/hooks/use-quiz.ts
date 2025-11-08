import { useQuizContext } from "@/contexts/quiz-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useQuiz() {
  const { state, dispatch } = useQuizContext();

  const startQuizMutation = useMutation({
    mutationFn: async ({ category, categoryId, topicId, difficultyId }: { 
      category?: string; 
      categoryId?: string; 
      topicId?: string; 
      difficultyId?: string; 
    }) => {
      let requestBody;
      
      if (categoryId && topicId && difficultyId) {
        requestBody = {
          categoryId,
          topicId,
          difficultyId
        };
      } else if (categoryId && difficultyId) {
        requestBody = {
          categoryId,
          difficultyId
        };
      } else if (categoryId) {
        requestBody = {
          categoryId
        };
      } else {
        requestBody = {
          category: category || 'JavaScript'
        };
      }

      const sessionResponse = await apiRequest("POST", "/api/quiz/start", requestBody);
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
    onError: (error) => {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Erro ao iniciar quiz'
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

  const startQuiz = async (categoryOrId?: string, topicId?: string, difficultyId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    let params;
    
    if (categoryOrId && topicId && difficultyId) {
      params = {
        categoryId: categoryOrId,
        topicId: topicId,
        difficultyId: difficultyId
      };
    } 
    else if (difficultyId) {
      params = {
        categoryId: categoryOrId,
        difficultyId: difficultyId
      };
    } else if (categoryOrId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryOrId);
      
      if (isUUID) {
        params = { categoryId: categoryOrId };
      } else {
        params = { category: categoryOrId };
      }
    } else {
      params = { category: 'JavaScript' };
    }
        
    try {
      const result = await startQuizMutation.mutateAsync(params);
      
      if (!result.questions || result.questions.length === 0) {
        const errorMessage = 'Não temos perguntas para a categoria/dificuldade selecionada';
        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage
        });
        throw new Error(errorMessage);
      }
      
      return result.sessionToken;
    } catch (error) {
      console.error('❌ Erro ao iniciar quiz:', error);
      throw error;
    }
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

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const startQuizWithSelection = async (categoryId: string, topicId: string, difficultyId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const params = {
      categoryId,
      topicId,
      difficultyId
    };
        
    try {
      const result = await startQuizMutation.mutateAsync(params);
      
      if (!result.questions || result.questions.length === 0) {
        const errorMessage = 'Não temos perguntas para a categoria/tópico/dificuldade selecionada';
        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage
        });
        throw new Error(errorMessage);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao iniciar quiz';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  return {
    ...state,
    startQuiz,
    startQuizWithSelection,
    submitAnswer,
    completeQuiz,
    nextQuestion,
    setShowFeedback,
    resetQuiz,
    clearError,
    isLoading: state.isLoading || startQuizMutation.isPending,
  };
}
