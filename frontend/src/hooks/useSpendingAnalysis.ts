import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { SpendingAnalysis } from "../types/analysis/SpendingAnalysis";

export const useSpendingAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SpendingAnalysis | null>(null);

  const spendingAnalysisApi = useApi<SpendingAnalysis, { year: number; month: number }>("/api/finance/account/analysis", "POST");

  const fetchAnalysis = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await spendingAnalysisApi.execute({ year, month });
      if (response?.isSuccess && response?.result) {
        setData(response.result);
      } else {
        throw new Error(response?.message || "데이터 조회에 실패했습니다.");
      }
    } catch (err) {
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
