import { useState } from "react";
import { useQuiz } from "@/hooks/use-quiz";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function useStartQuiz() {
  const [, setLocation] = useLocation();
  const { startQuiz, isLoading, sessionToken, questions } = useQuiz();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (sessionToken && questions.length > 0) {
      setLocation(`/quiz`);
    };
  });

  const handleStartQuiz = async () => {
    setIsStarting(true);
    try {
      await startQuiz();
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setIsStarting(false);
    }
  };

  return { handleStartQuiz, isStarting, isLoading };
}