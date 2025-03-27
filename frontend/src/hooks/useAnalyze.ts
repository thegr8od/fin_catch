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

export interface WrongAnswer {
  quizLogId: number;
  memberId: number;
  quizId: number;
  createdAt: Date;
  userAnswer: string;
  isCorrect: boolean;
}

interface AllWrongAnswer {
  allWrongAnswer: WrongAnswer[];
}

export const useAnalyze = () => {
  const { loading, error, execute: analyzeAnswer } = useApi<AnalyzeResponse, AnalyzePayload>("api/ai/analyze", "POST");
  const { execute: readWrongAnswer } = useApi<AllWrongAnswer>("api/quiz/wrong", "GET");
  const analyzeWrongAnswer = useCallback(
    async (quizId: number) => {
      return await analyzeAnswer({
        quizId,
      });
    },
    [analyzeAnswer]
  );

  const readAllWrongAnswer = useCallback(async () => {
    return await readWrongAnswer();
  }, [readWrongAnswer]);

  return {
    loading,
    error,
    analyzeWrongAnswer,
    readAllWrongAnswer,
  };
};
