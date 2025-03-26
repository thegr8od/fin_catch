import React from "react";
import { Account } from "../../types/Accounts/Account";

interface AccountAnalysisModalProps {
  onClose: () => void;
  accountInfo: Account;
}

interface TransactionItem {
  id: number;
  description: string;
  amount: number;
  date?: string;
}

const AccountAnalysisModal: React.FC<AccountAnalysisModalProps> = ({ onClose, accountInfo }) => {
  // 임시 거래 내역 데이터
  const transactions: TransactionItem[] = [
    { id: 1, description: "CU 편의점", amount: 7800 },
    { id: 2, description: "GS25", amount: 12400 },
    { id: 3, description: "새로 입금됨", amount: 37000 },
    { id: 4, description: "CU 편의점", amount: 12000 },
    { id: 5, description: "GS25", amount: 29000 },
  ];

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[800px] bg-blue-50/95 rounded-2xl shadow-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 영역 */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 mr-3">
            <img src="/src/assets/characters/smoke_cat.png" alt="고양이 캐릭터" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-korean-pixel">
              당신은 <span className="text-red-500">편의점</span> 홀릭입니다!
            </h2>
          </div>

          {/* 닫기 버튼 */}
          <button className="absolute right-6 top-6 text-gray-700 hover:text-gray-900" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex">
          {/* 왼쪽 섹션 - 계좌 정보 및 거래 내역 */}
          <div className="w-1/2 pr-4">
            {/* 계좌 잔액 */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="font-korean-pixel text-lg">현재 잔고</h3>
                <p className="font-korean-pixel text-xl font-bold">{formatNumber(accountInfo.accountBalance)} 원</p>
              </div>
            </div>

            {/* 거래 내역 */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <table className="w-full border-collapse">
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 font-korean-pixel">{transaction.description}</td>
                      <td className="py-2 text-right font-korean-pixel font-bold">{formatNumber(transaction.amount)} 원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 오른쪽 섹션 - 분석 차트 */}
          <div className="w-1/2 pl-4">
            <div className="bg-white rounded-xl p-5 shadow-md h-full flex flex-col">
              {/* 원형 차트 영역 */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 원형 차트 시각화 - 이미지와 유사하게 수정 */}
                  <div className="relative w-64 h-64">
                    {/* 편의점 원 - 가장 큰 원 */}
                    <div className="absolute inset-0 bg-blue-100 rounded-full"></div>

                    {/* 교통비 원 - 중간 크기 원 */}
                    <div className="absolute right-0 top-8 w-48 h-48 bg-green-100 rounded-full"></div>

                    {/* 여가 원 - 가장 작은 원 */}
                    <div className="absolute bottom-4 right-8 w-24 h-24 bg-yellow-100 rounded-full"></div>

                    {/* 카테고리 레이블 */}
                    <div className="absolute top-12 left-12 font-korean-pixel text-lg">편의점</div>
                    <div className="absolute top-20 right-12 font-korean-pixel text-lg">교통비</div>
                    <div className="absolute bottom-8 right-16 font-korean-pixel text-sm">여가</div>
                  </div>
                </div>
              </div>

              {/* 분석 팁 */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="mb-1">
                  <h3 className="font-korean-pixel text-lg font-bold">냥Tip</h3>
                </div>
                <div className="font-korean-pixel text-gray-700 font-bold">편의점을 그만 가라옹</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountAnalysisModal;
