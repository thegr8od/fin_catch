import { useApi } from "./useApi";

interface analyzePayload {
  quizId: number;
}

export const useAnalyze = () => {
  const { loading, error, execute: analyzeAnswer } = useApi<boolean, analyzePayload>("api/ai/analyze", "POST");

  const analyzeWrongAnswer = async (quizId: number) => {
    return await analyzeAnswer({
      quizId,
    });
  };

  return {
    loading,
    error,
    analyzeWrongAnswer,
  };
};
