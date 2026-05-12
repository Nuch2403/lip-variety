import { useState } from "react";
import { loadQuiz, patchQuiz, resetQuiz } from "@/features/quiz/model/quizStorage";
import type { QuizState } from "@/types/index";

export function useLocalQuiz(): {
  quiz: QuizState;
  setField: <K extends keyof QuizState>(k: K, v: QuizState[K]) => void;
  reset: () => void;
} {
  const [quiz, setQuiz] = useState<QuizState>(() => loadQuiz());

  const setField = <K extends keyof QuizState>(k: K, v: QuizState[K]) => {
    setQuiz(patchQuiz({ [k]: v } as Partial<QuizState>));
  };

  const reset = () => {
    resetQuiz();
    setQuiz({});
  };

  return { quiz, setField, reset };
}
