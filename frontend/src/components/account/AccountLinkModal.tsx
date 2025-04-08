import React, { useState, useEffect } from "react";
import { bankLogo } from "../../utils/BankLogo";
import { Account } from "../../types/Accounts/Account";
import { useApi } from "../../hooks/useApi";

interface AccountLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkAccount: (accountInfo: Account) => void;
  accounts: Account[];
  fetchAllAccount: () => Promise<any>;
}

const AccountLinkModal: React.FC<AccountLinkModalProps> = ({ isOpen, onClose, onLinkAccount, accounts, fetchAllAccount }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectLoading, setSelectLoading] = useState<boolean>(false);
  const [selectError, setSelectError] = useState<string | null>(null);

  const changeAccountApi = useApi<string, { accountNo: string }>("/api/finance/account/change", "PATCH");
  const pullUpAccountApi = useApi<Account[]>("/api/finance/account/all", "PATCH");
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      fetchAllAccount().finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handlePullUp = async () => {
    setSelectLoading(true);
    setSelectError(null);
    try {
      const response = await pullUpAccountApi.execute();
      if (response?.isSuccess) {
        // 계좌 목록 새로고침
        await fetchAllAccount();
      } else {
        throw new Error("계좌 동기화에 실패했습니다.");
      }
    } catch (error) {
      setSelectError("계좌 동기화에 실패했습니다.");
      console.error("계좌 동기화 에러:", error);
    } finally {
      setSelectLoading(false);
    }
  };

  const handleAccountSelect = async (account: Account) => {
    setSelectLoading(true);
    setSelectError(null);
    try {
      const response = await changeAccountApi.execute({ accountNo: account.accountNo });
      if (response?.isSuccess) {
        onLinkAccount(account);
        onClose();
      } else {
        throw new Error("주 거래 통장 설정에 실패했습니다.");
      }
    } catch (error) {
      setSelectError("주 거래 통장 설정에 실패했습니다.");
      console.error("계좌 설정 에러:", error);
    } finally {
      setSelectLoading(false);
    }
  };

  const formataccountNo = (accountNo: number) => {
    const numbers = accountNo.toString();
    return numbers.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("ko-KR").format(balance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[800px] h-[600px] relative" onClick={(e) => e.stopPropagation()}>
        {/* 제목 부분 */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">주 거래 통장 선택</h2>
            <button onClick={handlePullUp} className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200" title="계좌 목록 새로고침">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {/* 닫기 버튼 */}
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 부분 - 스크롤 가능한 영역 */}
        <div className="mt-20 h-[calc(100%-5rem)] overflow-y-auto px-10 py-8">
          {loading || selectLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
            </div>
          ) : error || selectError ? (
            <div className="text-center text-red-500 font-korean-pixel">{error || selectError}</div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <button
                  key={account.accountNo}
                  className="w-full bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-200 hover:border-primary"
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={bankLogo[account.bankCode.toString()]} alt="bank logo" className="max-w-full max-h-full" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-korean-pixel text-gray-800">{account.accountName}</div>
                      <div className="text-sm font-korean-pixel text-gray-600">{account.accountNo}</div>
                    </div>
                  </div>
                  <div className="text-right font-korean-pixel">
                    <div className="text-lg font-semibold text-gray-800">{formatBalance(account.accountBalance)}원</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountLinkModal;
