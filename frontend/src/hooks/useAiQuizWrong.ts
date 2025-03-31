// hooks/useAiQuizWrong.ts
import { useCallback } from "react";
import { useApi } from "./useApi";

// 인터페이스 정의
export interface WrongAnswer {
  quizId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
}

interface WrongAnswersResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: WrongAnswer[];
}

export const useAiQuizWrong = () => {
  // 소비내역 기반 AI퀴즈 오답 노트 조회
  const { 
    loading, 
    error, 
    execute: fetchWrongAnswers,
    data: wrongAnswers
  } = useApi<WrongAnswersResponse>("/api/ai/consumption/wrong", "GET");

  // 오답 목록 조회 함수
  const getWrongAnswers = useCallback(async () => {
    return await fetchWrongAnswers();
  }, [fetchWrongAnswers]);

  return {
    loading,
    error,
    wrongAnswers: wrongAnswers?.result || [],
    getWrongAnswers
  };
};