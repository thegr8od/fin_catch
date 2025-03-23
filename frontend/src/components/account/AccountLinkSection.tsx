import React from "react";

interface AccountLinkSectionProps {
  onAccountLink: () => void;
}

const AccountLinkSection: React.FC<AccountLinkSectionProps> = ({ onAccountLink }) => {
  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💳 계좌 연동</h3>
        <button onClick={onAccountLink} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300">
          연동하기
        </button>
      </div>
      <div className="bg-gray-50 p-6 rounded-xl text-center">
        <p className="text-gray-600 font-korean-pixel text-lg mb-2">계좌를 연동하고</p>
        <p className="text-gray-800 font-korean-pixel text-xl font-bold">더 많은 기능을 사용해보세요!</p>
      </div>
    </div>
  );
};

export default AccountLinkSection;
