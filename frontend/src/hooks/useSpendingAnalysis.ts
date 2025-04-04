import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { SpendingAnalysis, SpendingCategory } from "../types/analysis/SpendingAnalysis";

type APIResponse = {
  [key: string]: number;
};

export const useSpendingAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SpendingAnalysis | null>(null);

  const spendingAnalysisApi = useApi<APIResponse, { year: number; month: number }>("/api/finance/account/analysis", "POST");

  const parseResponse = (response: APIResponse): SpendingAnalysis => {
    console.log("원본 API 응답:", response);

    const result: SpendingAnalysis = {};

    // 문자열로 된 키를 SpendingCategory로 변환
    Object.entries(response).forEach(([key, value]) => {
      // 따옴표 제거 및 공백 제거
      const cleanKey = key.replace(/[\"\']/g, "").trim() as SpendingCategory;
      if (value !== null && value !== undefined) {
        result[cleanKey] = value;
      }
    });

    console.log("파싱된 데이터:", result);
    return result;
  };

  const fetchAnalysis = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`${year}년 ${month}월 소비패턴 분석 데이터 요청`);
      const response = await spendingAnalysisApi.execute({ year, month });
      console.log("API 응답 전체:", response);

      if (response?.isSuccess && response?.result) {
        const parsedData = parseResponse(response.result);
        setData(parsedData);
      } else {
        throw new Error(response?.message || "데이터 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("소비패턴 분석 에러:", err);
      setError(err instanceof Error ? err.message : "데이터 조회 중 오류가 발생했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // 현재 연월로 초기 데이터 조회
  useEffect(() => {
    const now = new Date();
    fetchAnalysis(now.getFullYear(), now.getMonth() + 1);
  }, []);

  return {
    loading,
    error,
    data,
    fetchAnalysis,
  };
};
