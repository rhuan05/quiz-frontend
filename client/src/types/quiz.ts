// Tipos para quiz que espelham o schema do backend
export interface Option {
  id: string;
  text: string;
  questionId: string;
  isCorrect: boolean;
  position?: number;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text?: string;
  categoryId?: string;
  difficultyId?: string;
  points?: number;
  options?: Option[];
  correctOptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionWithOptions extends Question {
  options: Option[];
  category?: { id: string; name: string; [key: string]: any };
  difficulty?: { id: string; label: string; [key: string]: any };
  question?: string;
  code?: string;
  title?: string;
  [key: string]: any;
}

export interface QuizSession {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'paused';
  totalQuestions: number;
  currentQuestionIndex: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalPoints: number;
  timeSpent: number;
  categoryId?: string;
  difficultyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  createdAt: Date;
}