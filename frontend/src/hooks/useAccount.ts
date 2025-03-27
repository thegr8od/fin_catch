import { useApi } from "./useApi";
import { AllAccount, AccountDetail, AllConsumeHistory, Account } from "../types/Accounts/Account";
import { useCallback, useState, useEffect } from "react";
import { useUserInfo } from "./useUserInfo";

export const useAccount = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const allAccountApi = useApi<AllAccount>("/api/finance/account/all", "POST");
  const accountDetailApi = useApi<AccountDetail, { accountNo: number }>("/api/finance/account/detail", "POST");
  const consumeHistoryApi = useApi<AllConsumeHistory, { accountNo: number; startDate: string; endDate: string; transactionType: string }>("/api/finance/account/transactions", "POST");
  const { user } = useUserInfo(false); // autoFetch를 false로 설정하여 자동 조회 방지

  const fetchAllAccount = useCallback(async () => {
    try {
      console.log("계좌 목록 API 호출 시작");
      const response = await allAccountApi.execute();
      console.log("계좌 목록 API 응답:", response);

      // financeMember가 null인 경우도 정상적으로 처리
      if (response.success && !response.error) {
        setAccounts(response.data?.accounts || []);
        setError(null);
      } else {
        setAccounts([]);
        // 에러 메시지 구체화
        const errorMessage = response.error?.includes("financeMember") ? "금융 회원 정보가 없습니다. 계좌를 연동해주세요." : "계좌 정보를 가져오는데 실패했습니다.";
        setError(errorMessage);
      }

      return response;
    } catch (error: any) {
      console.error("계좌 목록 조회 에러:", error);
      setAccounts([]);
      setError("계좌 정보를 가져오는데 실패했습니다.");
      return {
        success: false,
        error: error?.message || "계좌 정보를 가져오는데 실패했습니다.",
        data: { accounts: [] },
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
    async (accountNo: number) => {
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
    async (accountNo: number, startDate: string, endDate: string, transactionType: string) => {
      try {
        const response = await consumeHistoryApi.execute({ accountNo, startDate, endDate, transactionType });
        return response;
      } catch (error) {
        console.error("거래 내역 조회 에러:", error);
        throw error;
      }
    },
    [consumeHistoryApi]
  );

  return {
    accounts,
    error,
    fetchAllAccount,
    fetchAccountDetail,
    fetchConsumeHistory,
  };
};
