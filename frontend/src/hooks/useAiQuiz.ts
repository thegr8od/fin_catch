import { useApi } from "./useApi";
import { useCallback } from "react";

// 인터페이스 정의
interface QuizOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuizItem {
  quizId: number;
  question: string;
  options: QuizOption[];
}

export interface QuizResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: QuizItem[];
}

interface SubmitAnswerPayload {
  quizId: number;
  selectedIndex: number;
}

interface SubmitAnswerResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: boolean; // 명확하게 boolean 타입으로 정의
}

export const useAiQuiz = () => { 
  // 최신 소비내역 기반 AI퀴즈 조회
  const { loading, error, execute: fetchLatestQuizzes } = useApi<QuizResponse>("/api/ai/consumption/latest", "GET");
  
  // 소비내역 기반 AI퀴즈 정답 제출
  const { loading: submitLoading, error: submitError, execute: submitAnswer } = useApi<SubmitAnswerResponse, SubmitAnswerPayload>("/api/ai/consumption/submit", "POST");
  
  // 최신 퀴즈 목록 조회 함수
  const getLatestQuizContent = useCallback(async () => {
    try {
      const response = await fetchLatestQuizzes();
      console.log("최신 퀴즈 목록 조회 응답:", response);
      return response;
    } catch (error) {
      console.error("퀴즈 목록 조회 중 오류:", error);
      // 오류 시 기본 응답 구조 반환
      return {
        isSuccess: false,
        code: 500,
        message: "퀴즈 데이터를 가져오는데 실패했습니다.",
        result: [] as QuizItem[] // 명시적으로 타입 지정
      };
    }
  }, [fetchLatestQuizzes]);

  // 정답 제출 함수
  const submitQuizAnswer = useCallback(async (quizId: number, selectedIndex: number) => {
    try {
      // 제출 전 로그
      console.log("정답 제출 요청:", { quizId, selectedIndex });
      
      const response = await submitAnswer({
        quizId,
        selectedIndex
      });
      
      // 제출 후 로그
      console.log("정답 제출 응답:", response);
      
      return response;
    } catch (error) {
      console.error("정답 제출 중 오류:", error);
      // 오류 시 기본 응답 구조 반환
      return {
        isSuccess: false,
        code: 500,
        message: "정답 제출에 실패했습니다.",
        result: false
      };
    }
  }, [submitAnswer]);

  return { 
    loading, 
    error, 
    submitLoading, 
    submitError, 
    getLatestQuizContent, 
    submitQuizAnswer 
  };
};