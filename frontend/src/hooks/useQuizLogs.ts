import { useApi } from "./useApi";
import { useCallback, useState } from "react";

export interface QuizLogItem {
  quizLogId: number;
  memberId: number;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: string;
}

interface QuizLogsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: QuizLogItem[];
}

export interface QuizLogStats {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  correctRate: number;
  userDistribution: {
    totalUsers: number;
    correctUsers: number;
    incorrectUsers: number;
  };
  attemptsHistory: {
    date: string;
    isCorrect: boolean;
    memberId: number;
  }[];
}

export const useQuizLogs = () => {
  const [stats, setStats] = useState<QuizLogStats | null>(null);
  const { loading, error, execute: fetchQuizLogs } = useApi<QuizLogsResponse>('', 'GET');

  const getQuizLogs = useCallback(async (quizId: number) => {
    try {
      const response = await fetchQuizLogs(undefined, {
        url: `/api/quiz/logs/${quizId}`
      });

      if (response.isSuccess && Array.isArray(response.result)) {
        const logs = response.result;
        
        // 모든 시도 횟수
        const totalAttempts = logs.length;
        
        // 정답 시도 횟수
        const correctAttempts = logs.filter(log => log.isCorrect).length;
        
        // 오답 시도 횟수
        const incorrectAttempts = totalAttempts - correctAttempts;
        
        // 정답률
        const correctRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
        
        // 사용자별 집계
        const uniqueUsers = new Set(logs.map(log => log.memberId));
        const correctUsers = new Set(logs.filter(log => log.isCorrect).map(log => log.memberId));
        const incorrectUsers = new Set(logs.filter(log => !log.isCorrect).map(log => log.memberId));
        
        // 히스토리 데이터 정리
        const attemptsHistory = logs.map(log => ({
          date: new Date(log.createdAt).toISOString().split('T')[0],
          isCorrect: log.isCorrect,
          memberId: log.memberId
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        const calculatedStats: QuizLogStats = {
          totalAttempts,
          correctAttempts,
          incorrectAttempts,
          correctRate,
          userDistribution: {
            totalUsers: uniqueUsers.size,
            correctUsers: correctUsers.size,
            incorrectUsers: incorrectUsers.size
          },
          attemptsHistory
        };
        
        setStats(calculatedStats);
        return calculatedStats;
      }
      
      return null;
    } catch (error) {
      console.error("퀴즈 로그 조회 중 오류:", error);
      return null;
    }
  }, [fetchQuizLogs]);

  return {
    loading,
    error,
    stats,
    getQuizLogs
  };
};