import { useApi } from "./useApi";
import { AllAccount, AccountDetail, AllConsumeHistory, ConsumeHistoryList, Account } from "../types/Accounts/Account";
import { useCallback, useState, useEffect } from "react";
import { useUserInfo } from "./useUserInfo";

export const useAccount = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const allAccountApi = useApi<AllAccount>("/api/finance/account/all", "POST");
  const patchAccountApi = useApi<AllAccount>("/api/finance/account/all", "PATCH");
  const accountDetailApi = useApi<AccountDetail, { accountNo: string }>("/api/finance/account/detail", "POST");
  const consumeHistoryApi = useApi<ConsumeHistoryList, { accountNo: string; year: number; month: number }>("/api/finance/account/transactions", "POST");
  // 싸피 12기 화이팅!!
  const consumeAnalysisApi = useApi<Record<string, string>, { year: number; month: number }>("/api/finance/account/analysis", "POST");
  const changeAccountApi = useApi<string, { accountNo: string }>("/api/finance/account/change", "PATCH");
  const { user } = useUserInfo(false); // autoFetch를 false로 설정하여 자동 조회 방지

  const fetchAllAccount = useCallback(async () => {
    if (Date.now() - lastFetchTime < 3000 && accounts.length > 0) {
      return { isSuccess: true, result: { accounts } };
    }
    try {
      const response = await allAccountApi.execute();

      // financeMember가 null인 경우도 정상적으로 처리
      if (response.isSuccess && response.result) {
        setAccounts(response.result.accounts || []);
        setError(null);
      } else {
        setAccounts([]);
        // 에러 메시지 구체화
        const errorMessage = response.message?.includes("financeMember") ? "금융 회원 정보가 없습니다. 계좌를 연동해주세요." : "계좌 정보를 가져오는데 실패했습니다.";
        setError(errorMessage);
      }

      return response;
    } catch (error: any) {
      console.error("계좌 목록 조회 에러:", error);
      setAccounts([]);
      setError("계좌 정보를 가져오는데 실패했습니다.");
      return {
        isSuccess: false,
        code: 500,
        message: error?.message || "계좌 정보를 가져오는데 실패했습니다.",
        result: null,
      };
    }
  }, [allAccountApi]);

  // 사용자 정보가 있을 때 한 번만 계좌 목록 조회
  useEffect(() => {
    if (user) {
      fetchAllAccount().catch((error) => {
        console.error("계좌 목록 조회 실패:", error);
      });
    }
  }, [user]);

  const fetchAccountDetail = useCallback(
    async (accountNo: string) => {
      try {
        const response = await accountDetailApi.execute({ accountNo });
        return response;
      } catch (error) {
        console.error("계좌 상세 조회 에러:", error);
        throw error;
      }
    },
    [accountDetailApi]
  );

  const fetchConsumeHistory = useCallback(
    async (accountNo: string, year: number, month: number) => {
      try {
        const response = await consumeHistoryApi.execute({ accountNo, year, month });

        if (response.isSuccess && response.result) {
          // API 응답이 이미 ConsumeHistoryResponse 형식과 일치하는 경우
          if (response.result && response.result.list) {
            return {
              isSuccess: true,
              code: 200,
              message: "요청에 성공하였습니다.",
              result: response.result,
            };
          }

          // API 응답을 ConsumeHistoryResponse 형식으로 변환

          return {
            isSuccess: true,
            code: 200,
            message: "요청에 성공하였습니다.",
            result: response.result,
          };
        }

        return {
          isSuccess: false,
          code: 500,
          message: "거래내역 조회에 실패했습니다.",
          result: null,
        };
      } catch (error) {
        console.error("거래 내역 조회 에러:", error);
        throw error;
      }
    },
    [consumeHistoryApi]
  );

  const fetchConsumeAnalysis = useCallback(
    async (year: number, month: number) => {
      try {
        const response = await consumeAnalysisApi.execute({ year, month });
        return response;
      } catch (error) {
        console.error("소비 분석 조회 에러:", error);
        throw error;
      }
    },
    [consumeAnalysisApi]
  );

  const patchAccount = useCallback(async () => {
    try {
      const response = await patchAccountApi.execute();
      if (response?.isSuccess) {
        // 계좌 목록 새로고침
        await fetchAllAccount();
      }
      return response;
    } catch (error) {
      console.error("계좌 목록 갱신 에러:", error);
      throw error;
    }
  }, [patchAccountApi, fetchAllAccount]);

  const changeAccount = useCallback(
    async (accountNo: string) => {
      try {
        const response = await changeAccountApi.execute({ accountNo });
        return response;
      } catch (error) {
        console.error("계좌 변경 에러:", error);
        throw error;
      }
    },
    [changeAccountApi]
  );

  return {
    accounts,
    error,
    fetchAllAccount,
    fetchAccountDetail,
    fetchConsumeHistory,
    changeAccount,
    patchAccount,
    fetchConsumeAnalysis,
  };
};
