import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import type { QuestionWithOptions } from "../types/quiz";

interface QuizState {
  sessionToken: string | null;
  questions: QuestionWithOptions[];
  currentQuestionIndex: number;
  answers: Array<{
    questionId: string;
    optionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  score: number;
  isLoading: boolean;
  error: string | null;
  showFeedback: boolean;
  feedbackData: {
    isCorrect: boolean;
    correctOption: any;
    explanation: string;
  } | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

type QuizAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_QUIZ'; payload: { sessionToken: string; questions: QuestionWithOptions[]; user?: { id: string; email: string; name: string; } } }
  | { type: 'SUBMIT_ANSWER'; payload: { questionId: string; optionId: string; isCorrect: boolean; timeSpent: number; feedbackData: any } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SET_FEEDBACK'; payload: { show: boolean; data?: any } }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  sessionToken: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  isLoading: false,
  error: null,
  showFeedback: false,
  feedbackData: null,
  user: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'START_QUIZ':
      const startQuizState = {
        ...state,
        sessionToken: action.payload.sessionToken,
        questions: action.payload.questions,
        user: action.payload.user || null,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        isLoading: false,
        error: null,
      };
      
      localStorage.setItem('currentQuizSession', JSON.stringify({
        sessionToken: action.payload.sessionToken,
        questions: action.payload.questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        user: action.payload.user || null,
      }));
      
      return startQuizState;
    
    case 'SUBMIT_ANSWER':
      const newAnswer = {
        questionId: action.payload.questionId,
        optionId: action.payload.optionId,
        isCorrect: action.payload.isCorrect,
        timeSpent: action.payload.timeSpent,
      };
      
      const newAnswers = [...state.answers, newAnswer];
      const correctCount = newAnswers.filter(a => a.isCorrect).length;
      const newScore = (correctCount / state.questions.length) * 100;
      
      return {
        ...state,
        answers: newAnswers,
        score: newScore,
        showFeedback: true,
        feedbackData: action.payload.feedbackData,
      };
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        showFeedback: false,
        feedbackData: null,
      };
    
    case 'SET_FEEDBACK':
      return {
        ...state,
        showFeedback: action.payload.show,
        feedbackData: action.payload.data || null,
      };
    
    case 'RESET_QUIZ':
      localStorage.removeItem('currentQuizSession');
      return initialState;
    
    default:
      return state;
  }
}

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    const savedSession = localStorage.getItem('currentQuizSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        dispatch({
          type: 'START_QUIZ',
          payload: {
            sessionToken: session.sessionToken,
            questions: session.questions,
            user: session.user
          }
        });
        
        if (session.currentQuestionIndex > 0) {
          for (let i = 0; i < session.currentQuestionIndex; i++) {
            dispatch({ type: 'NEXT_QUESTION' });
          }
        }
        
        if (session.answers && session.answers.length > 0) {
          session.answers.forEach((answer: any) => {
            dispatch({
              type: 'SUBMIT_ANSWER',
              payload: {
                questionId: answer.questionId,
                optionId: answer.optionId,
                isCorrect: answer.isCorrect,
                timeSpent: answer.timeSpent,
                feedbackData: null
              }
            });
          });
        }
        
      } catch (error) {
        console.error('Erro ao carregar sessão salva:', error);
        localStorage.removeItem('currentQuizSession');
      }
    }
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuizContext() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
}
