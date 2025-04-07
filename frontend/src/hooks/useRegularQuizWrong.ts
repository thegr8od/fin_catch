import { useApi } from "./useApi";
import { useCallback, useState, useEffect } from "react";

export interface QuizWrongLog {
  quizId: number;
  quizMode: "MULTIPLE_CHOICE" | "ESSAY" | "SHORT_ANSWER";
  quizSubject: string;
  question: string;
  correctAnswer: string | null;
  userAnswer: string;
  createdAt: string;
}

interface QuizWrongResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: QuizWrongLog[];
}

export const useRegularQuizWrong = () => { 
  const { loading, error, execute: fetchWrongQuizLogs } = useApi<QuizWrongResponse>("/api/quiz/wrong", "GET");
  
  const [wrongQuizLogs, setWrongQuizLogs] = useState<QuizWrongLog[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<QuizWrongLog[]>([]);

  // 중복 로그 제거 및 최신 로그만 유지
  const processWrongLogs = useCallback((logs: QuizWrongLog[]) => {
    const uniqueLogs: { [key: number]: QuizWrongLog } = {};
    
    // 최신 로그만 유지
    logs.forEach(log => {
      if (!uniqueLogs[log.quizId] || 
          new Date(log.createdAt) > new Date(uniqueLogs[log.quizId].createdAt)) {
        uniqueLogs[log.quizId] = log;
      }
    });

    return Object.values(uniqueLogs);
  }, []);

  const getRegularWrongQuizLogs = useCallback(async () => {
    try {
      const response = await fetchWrongQuizLogs();
      if (response.isSuccess && response.result) {
        // unknown을 통한 타입 단언
        const logs = response.result as unknown as QuizWrongLog[];
        const processedLogs = processWrongLogs(logs);
        setWrongQuizLogs(logs);
        setGroupedLogs(processedLogs);
        return response;
      } else {
        console.error("퀴즈 목록 조회 중 오류:", response.message);
        return {
          isSuccess: false,
          code: 500,
          message: "퀴즈 데이터를 가져오는데 실패했습니다.",
          result: []
        };
      }
    } catch (error) {
      console.error("퀴즈 목록 조회 중 오류:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "퀴즈 데이터를 가져오는데 실패했습니다.",
        result: []
      };
    }
  }, [fetchWrongQuizLogs, processWrongLogs]);

  useEffect(() => {
    getRegularWrongQuizLogs();
  }, [getRegularWrongQuizLogs]);

  return { 
    loading, 
    error, 
    wrongQuizLogs,
    groupedLogs,
    getRegularWrongQuizLogs
  };
}