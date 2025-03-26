import { useState, useCallback } from "react";
import { Account } from "../types/Accounts/Account";
import { useAccount } from "./useAccount";

interface UseLoadAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
}

// 더미 데이터
const dummyAccounts: Account[] = [
  {
    accountNumber: 1234567890,
    bankCode: "004",
    productName: "KB국민 ONE통장",
    accountBalance: 1500000,
    isDefault: true,
  },
  {
    accountNumber: 2345678901,
    bankCode: "088",
    productName: "신한 주거래 통장",
    accountBalance: 2800000,
    isDefault: false,
  },
  {
    accountNumber: 3456789012,
    bankCode: "011",
    productName: "NH농협 통장",
    accountBalance: 950000,
    isDefault: false,
  },
  {
    accountNumber: 4567890123,
    bankCode: "020",
    productName: "우리 급여통장",
    accountBalance: 3200000,
    isDefault: false,
  },
  {
    accountNumber: 5678901234,
    bankCode: "081",
    productName: "하나 월급통장",
    accountBalance: 1800000,
    isDefault: false,
  },
  {
    accountNumber: 6789012345,
    bankCode: "090",
    productName: "카카오뱅크 입출금통장",
    accountBalance: 750000,
    isDefault: false,
  },
];

export const useLoadAccounts = (): UseLoadAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchAllAccount } = useAccount();

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 실제 API 호출 대신 더미 데이터 사용
      // await new Promise((resolve) => setTimeout(resolve, 700)); // 로딩 시뮬레이션
      // setAccounts(dummyAccounts);

      // 실제 API 호출 코드 (주석 처리)
      const response = await fetchAllAccount();
      if (response.success && response.data) {
        setAccounts(response.data.accountList);
      } else {
        setError("계좌 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("계좌 정보를 불러오는데 실패했습니다.");
    }
    setLoading(false);
  }, []);

  return {
    accounts,
    loading,
    error,
    loadAccounts,
  };
};
