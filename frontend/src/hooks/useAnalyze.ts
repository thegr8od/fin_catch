import { useApi } from "./useApi";

interface analyzePayload {
  quizId: number;
  memberId: number;
}

export const useAnalyze = () => {
  const { loading, error, execute: analyzeAnswer } = useApi<boolean, analyzePayload>("api/ai/analyze", "POST");

  const analyzeWrongAnswer = async (quizId: number, memberId: number) => {
    return await analyzeAnswer({
      quizId,
      memberId,
    });
  };

  return {
    loading,
    error,
    analyzeWrongAnswer,
  };
};
