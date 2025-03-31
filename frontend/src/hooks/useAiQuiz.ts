import { useApi } from "./useApi";
import { useCallback } from "react";

// 인터페이스 정의
interface QuizOption {
  optionId: number;
  optionText: string;
}

interface QuizItem {
  quizId: number;
  question: string;
  options: QuizOption[];
}

interface QuizResponse {
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
  result: string;
}

export const useAiQuiz = () => { 
  // 최신 소비내역 기반 AI퀴즈 조회
  const { loading, error, execute: fetchLatestQuizzes } = useApi<QuizResponse>("/api/ai/consumption/latest", "GET");
  
  // 소비내역 기반 AI퀴즈 정답 제출
  const { loading: submitLoading, error: submitError, execute: submitAnswer } = useApi<SubmitAnswerResponse, SubmitAnswerPayload>("/api/ai/consumption/submit", "POST");
  
  // 최신 퀴즈 목록 조회 함수
  const getLatestQuizContent = useCallback(async () => {
    const response = await fetchLatestQuizzes();
    console.log("최신 퀴즈 목록 조회 응답:", response);
    return response;
  }, [fetchLatestQuizzes]);

  // 정답 제출 함수
  const submitQuizAnswer = useCallback(async (quizId: number, selectedIndex: number) => {
    // 제출 전 로그
    console.log("정답 제출 요청:", { quizId, selectedIndex });
    
    const response = await submitAnswer({
      quizId,
      selectedIndex
    });
    
    // 제출 후 로그
    console.log("정답 제출 응답:", response);
    
    return response;
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