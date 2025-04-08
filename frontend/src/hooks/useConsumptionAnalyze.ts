import { useApi } from "./useApi";
import { useCallback } from "react";

interface AnalyzeResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    analysis: string;
    weakness: string;
    recommendation: string;
  } | null;
}

export const useConsumptionAnalyze = () => {
  // 소비 퀴즈 분석 API 호출 
  const { loading, error, execute: fetchAnalysis } = useApi<AnalyzeResponse>(
    "/api/ai/consumption/analyze", 
    "POST"
  );

  // 소비 퀴즈 분석 함수
  const analyzeConsumptionWrongAnswer = useCallback(
    async (quizId: number) => {
      try {
        // URL에 직접 quizId 파라미터 추가
        const response = await fetchAnalysis(undefined, {
          url: `/api/ai/consumption/analyze?quizId=${quizId}`
        });
        
        if (response.isSuccess && response.result) {
          return response;
        } else {
          console.error("소비 퀴즈 분석 중 오류:", response.message);
          return {
            isSuccess: false,
            code: 500,
            message: "소비 퀴즈 분석에 실패했습니다.",
            result: null
          };
        }
      } catch (error) {
        console.error("소비 퀴즈 분석 API 호출 중 오류:", error);
        return {
          isSuccess: false,
          code: 500,
          message: "소비 퀴즈 분석에 실패했습니다.",
          result: null
        };
      }
    },
    [fetchAnalysis]
  );

  return {
    loading,
    error,
    analyzeConsumptionWrongAnswer
  };
};