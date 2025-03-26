import React, { useState } from "react";
import { bankLogo } from "../../utils/BankLogo";

interface MainAccount {
  bankCode: string;
  accountNumber: number;
  productName: string;
  balance: number;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: "입금" | "출금";
  description: string;
  balance: number;
}

// 더미 거래내역 데이터
const dummyTransactions: Transaction[] = [
  {
    id: 1,
    date: "2024-03-26 14:30",
    amount: 35000,
    type: "출금",
    description: "스타벅스 강남점",
    balance: 1465000,
  },
  {
    id: 2,
    date: "2024-03-26 12:15",
    amount: 12000,
    type: "출금",
    description: "CU 편의점",
    balance: 1500000,
  },
  {
    id: 3,
    date: "2024-03-26 10:00",
    amount: 1500000,
    type: "입금",
    description: "3월 급여",
    balance: 1512000,
  },
  {
    id: 4,
    date: "2024-03-25 19:45",
    amount: 45000,
    type: "출금",
    description: "김밥천국",
    balance: 12000,
  },
  {
    id: 5,
    date: "2024-03-25 15:20",
    amount: 8000,
    type: "출금",
    description: "지하철 교통비",
    balance: 57000,
  },
];

interface AccountLinkSectionProps {
  onAccountLink: () => void;
  mainAccount: MainAccount | null;
}

const AccountLinkSection: React.FC<AccountLinkSectionProps> = ({ onAccountLink, mainAccount }) => {
  const [showTransactions, setShowTransactions] = useState(false);

  const formatAccountNumber = (accountNumber: number) => {
    return accountNumber.toString().replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("ko-KR").format(balance);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💰 주 거래 통장</h3>
        {mainAccount && (
          <div className="flex gap-2">
            <button onClick={() => setShowTransactions(!showTransactions)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-korean-pixel hover:bg-blue-100 transition-colors">
              {showTransactions ? "내역 닫기" : "소비내역 보기"}
            </button>
            <button onClick={onAccountLink} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-korean-pixel hover:bg-gray-200 transition-colors">
              계좌 변경
            </button>
          </div>
        )}
      </div>

      {mainAccount ? (
        <>
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src={bankLogo[mainAccount.bankCode]} alt="bank logo" className="max-w-full max-h-full" />
                </div>
                <div>
                  <div className="text-lg font-korean-pixel text-gray-800">{mainAccount.productName}</div>
                  <div className="text-sm font-korean-pixel text-gray-600">{formatAccountNumber(mainAccount.accountNumber)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold font-korean-pixel text-gray-800">{formatBalance(mainAccount.balance)}원</div>
              </div>
            </div>
          </div>

          {showTransactions && (
            <div className="mt-6 bg-white rounded-xl border border-gray-100">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-korean-pixel text-gray-500">거래일시</th>
                      <th className="px-6 py-3 text-left text-sm font-korean-pixel text-gray-500">내용</th>
                      <th className="px-6 py-3 text-right text-sm font-korean-pixel text-gray-500">금액</th>
                      <th className="px-6 py-3 text-right text-sm font-korean-pixel text-gray-500">잔액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dummyTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-korean-pixel text-gray-600">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4 text-sm font-korean-pixel text-gray-800">{transaction.description}</td>
                        <td className={`px-6 py-4 text-sm font-korean-pixel text-right ${transaction.type === "출금" ? "text-red-600" : "text-blue-600"}`}>
                          {transaction.type === "출금" ? "-" : "+"}
                          {formatBalance(transaction.amount)}원
                        </td>
                        <td className="px-6 py-4 text-sm font-korean-pixel text-right text-gray-800">{formatBalance(transaction.balance)}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4 font-korean-pixel">아직 주 거래 통장이 설정되지 않았습니다</p>
          <button
            onClick={onAccountLink}
            className="px-6 py-3 bg-gradient-to-r from-form-color to-button-color text-gray-700 rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300"
          >
            주 거래 통장 설정하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountLinkSection;
