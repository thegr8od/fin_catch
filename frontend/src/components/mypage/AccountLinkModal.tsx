import React, { useState, useEffect } from "react";
import { bankLogo } from "../../utils/BankLogo";
import { Account } from "../../types/Accounts/Account";
import { useLoadAccounts } from "../../hooks/useLoadAccounts";

interface AccountLinkModalProps {
  onClose: () => void;
  onLinkAccount: (accountInfo: Account) => void;
}

const AccountLinkModal: React.FC<AccountLinkModalProps> = ({ onClose, onLinkAccount }) => {
  const { accounts, loading, error, loadAccounts } = useLoadAccounts();
  const [selectLoading, setSelectLoading] = useState<boolean>(false);
  const [selectError, setSelectError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleAccountSelect = async (account: Account) => {
    setSelectLoading(true);
    setSelectError(null);
    try {
      // 임시 딜레이로 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 실제 API 호출은 나중에 구현
      // const response = await setDefaultAccount(account.accountNumber);
      // if (!response.success) {
      //   throw new Error(response.message);
      // }

      console.log("선택된 계좌:", account);
      onLinkAccount(account);
      onClose();
    } catch (error) {
      setSelectError("주 거래 통장 설정에 실패했습니다.");
      console.error("계좌 설정 에러:", error);
    }
    setSelectLoading(false);
  };

  const formatAccountNumber = (accountNumber: number) => {
    const numbers = accountNumber.toString();
    return numbers.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("ko-KR").format(balance);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[800px] h-[600px] relative" onClick={(e) => e.stopPropagation()}>
        {/* 제목 부분 */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">주 거래 통장 선택</h2>

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
                  key={account.accountNumber}
                  className="w-full bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-200 hover:border-primary"
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={bankLogo[account.bankCode]} alt="bank logo" className="max-w-full max-h-full" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-korean-pixel text-gray-800">{account.productName}</div>
                      <div className="text-sm font-korean-pixel text-gray-600">{formatAccountNumber(account.accountNumber)}</div>
                    </div>
                  </div>
                  <div className="text-right font-korean-pixel">
                    <div className="text-lg font-semibold text-gray-800">{formatBalance(account.accountBalance)}원</div>
                    {account.isDefault && <div className="text-sm text-primary">현재 주 거래 통장</div>}
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
