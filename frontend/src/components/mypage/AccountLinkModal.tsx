import React, { useState } from "react";

interface AccountLinkModalProps {
  onClose: () => void;
  onLinkAccount: (accountInfo: AccountInfo) => void;
}

export interface AccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
}

const AccountLinkModal: React.FC<AccountLinkModalProps> = ({ onClose, onLinkAccount }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const banks = [
    { id: "shinhan", name: "신한은행", logo: "/assets/bank-logos/shinhan.png" },
    { id: "kb", name: "국민은행", logo: "/assets/bank-logos/kb.png" },
    { id: "woori", name: "우리은행", logo: "/assets/bank-logos/woori.png" },
    { id: "hana", name: "하나은행", logo: "/assets/bank-logos/hana.png" },
    { id: "nh", name: "농협은행", logo: "/assets/bank-logos/nh.png" },
    { id: "ibk", name: "기업은행", logo: "/assets/bank-logos/ibk.png" },
  ];

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep(2);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumber.trim()) {
      setError("계좌번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    // 실제로는 API 호출을 통해 계좌 인증을 진행합니다.
    // 여기서는 시뮬레이션을 위해 setTimeout을 사용합니다.
    setTimeout(() => {
      setLoading(false);

      // 임시 계좌 정보 생성
      const bankInfo = banks.find((bank) => bank.id === selectedBank);
      if (!bankInfo) {
        setError("은행 정보를 찾을 수 없습니다.");
        return;
      }

      const mockAccountInfo: AccountInfo = {
        bankName: bankInfo.name,
        accountNumber: accountNumber,
        accountHolder: "김냥냥",
        balance: 1550000,
      };

      console.log("계좌 연동 완료:", mockAccountInfo);

      // 계좌 연동 완료 후 부모 컴포넌트에 정보 전달하고 즉시 모달 닫기
      onLinkAccount(mockAccountInfo);
      onClose();
    }, 800); // 시뮬레이션 시간 단축
  };

  const formatAccountNumber = (value: string) => {
    // 숫자만 남기고 나머지 문자 제거
    const numbers = value.replace(/[^\d]/g, "");

    // 은행별로 다른 포맷팅을 적용할 수 있습니다.
    // 여기서는 간단하게 4자리마다 하이픈을 추가합니다.
    return numbers.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountNumber(e.target.value);
    setAccountNumber(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[700px] p-10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 제목 부분 */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">은행 연동하기</h2>

          {/* 닫기 버튼 */}
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 부분 */}
        <div className="mt-20 mb-8">
          {step === 1 && (
            <div className="px-6">
              <h3 className="text-xl font-bold text-gray-800 mb-8 font-korean-pixel">은행을 선택해주세요</h3>
              <div className="grid grid-cols-3 gap-6">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center border border-gray-200 hover:border-primary"
                    // onClick={() => handleBankSelect(bank.id)}
                  >
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <img src={bank.logo} alt={bank.name} className="max-w-full max-h-full" />
                    </div>
                    <span className="text-gray-700 text-lg font-korean-pixel">{bank.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="px-6">
              <h3 className="text-xl font-bold text-gray-800 mb-8 font-korean-pixel">계좌 정보를 입력해주세요</h3>
              <form onSubmit={handleAccountSubmit}>
                <div className="mb-8">
                  <label htmlFor="accountNumber" className="block text-gray-700 font-korean-pixel mb-3 text-lg">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    className="w-full px-5 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-form-color font-korean-pixel text-lg"
                    placeholder="계좌번호를 입력해주세요"
                    autoFocus
                    autoComplete="off"
                  />
                  {error && <p className="text-red-500 text-sm mt-2 font-korean-pixel">{error}</p>}
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all duration-300 shadow-sm font-korean-pixel mr-4 text-lg"
                    onClick={() => setStep(1)}
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-form-color to-button-color text-gray-700 hover:opacity-90 transition-all duration-300 shadow-md font-korean-pixel flex items-center text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        인증 중...
                      </>
                    ) : (
                      "인증하기"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountLinkModal;
