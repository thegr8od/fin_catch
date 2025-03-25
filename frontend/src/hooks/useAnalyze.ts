import { useApi } from "./useApi";
import { useCallback } from "react";

interface AnalyzePayload {
  quizId: number;
}

interface AnalyzeResponse {
  analysis: string;
  weakness: string;
  recommendation: string;
}

export const useAnalyze = () => {
  const { loading, error, execute: analyzeAnswer } = useApi<AnalyzeResponse, AnalyzePayload>("api/ai/analyze", "POST");

  const analyzeWrongAnswer = useCallback(
    async (quizId: number) => {
      return await analyzeAnswer({
        quizId,
      });
    },
    [analyzeAnswer]
  );

  return {
    loading,
    error,
    analyzeWrongAnswer,
  };
};
