import { useState } from "react";
import { loadQuiz, patchQuiz, resetQuiz } from "@/features/quiz/model/quizStorage";

export function useLocalQuiz() {
  const [quiz, setQuiz] = useState(() => loadQuiz());

  const setField = (k, v) => {
    setQuiz(patchQuiz({ [k]: v }));
  };

  const reset = () => {
    resetQuiz();
    setQuiz({});
  };

  return { quiz, setField, reset };
}
