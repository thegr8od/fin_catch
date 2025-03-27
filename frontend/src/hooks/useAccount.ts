import { useApi } from "./useApi";
import { AllAccount, AccountDetail, AllConsumeHistory } from "../types/Accounts/Account";
import { useCallback } from "react";

export const useAccount = () => {
  const allAccountApi = useApi<AllAccount>("/api/finance/account/all", "POST");
  const accountDetailApi = useApi<AccountDetail, { accountNo: number }>("/api/finance/account/detail", "POST");
  const consumeHistoryApi = useApi<AllConsumeHistory, { accountNo: number; startDate: string; endDate: string; transactionType: string }>("/api/finance/account/transactions", "POST");

  const fetchAllAccount = useCallback(async () => {
    try {
      console.log("계좌 목록 API 호출 시작");
      const response = await allAccountApi.execute();
      console.log("계좌 목록 API 응답:", response);
      return response;
    } catch (error: any) {
      console.error("계좌 목록 조회 에러:", error);
      console.error("에러 상세:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }, [allAccountApi]);

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
    fetchAllAccount,
    fetchAccountDetail,
    fetchConsumeHistory,
  };
};
