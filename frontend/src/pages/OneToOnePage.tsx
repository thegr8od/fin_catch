import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import oneToOneBackground from "../assets/one_vs_one.gif";
import investment from "../assets/investment.png";
import policy from "../assets/policy.png";
import product from "../assets/product.png";
import crime from "../assets/crime.png";

interface GameOption {
  id: string;
  name: string;
  image: string;
  description: string;
}

const OneToOnePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 게임 옵션 데이터
  const gameOptions: GameOption[] = [
    {
      id: "investment",
      name: "투자",
      image: investment,
      description: "투자 카테고리"
    },
    {
      id: "economy",
      name: "정책",
      image: policy,
      description: "정책 카테고리"
    },
    {
      id: "product",
      name: "상품",
      image: product,
      description: "상품 카테고리"
    },
    {
      id: "delivery",
      name: "범죄",
      image: crime,
      description: "범죄 카테고리"
    }
  ];

  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    // 여기에 선택한 옵션에 따른 로직 추가
    console.log(`선택된 옵션: ${optionId}`);
    // 예: navigate(`/game/${optionId}`);
  };

  const handleBackClick = () => {
    navigate("/main");
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${oneToOneBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 뒤로 가기 버튼 */}
      <button 
        className="absolute top-4 left-4 bg-white bg-opacity-70 text-black py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors"
        onClick={handleBackClick}
      >
        ← 뒤로 가기
      </button>
      
      {/* 타이틀 */}
      <h1 className="text-4xl font-bold text-white mb-8 text-shadow-lg">1:1 대결</h1>
      
      {/* 게임 옵션 그리드 */}
      <div className="grid grid-cols-2 gap-8 max-w-2xl">
        {gameOptions.map((option) => (
          <div 
            key={option.id}
            className="bg-sky-200 bg-opacity-70 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-sky-300 hover:bg-opacity-80 transition-colors transform hover:scale-105"
            onClick={() => handleOptionClick(option.id)}
          >
            <img 
              src={option.image} 
              alt={option.name} 
              className="w-32 h-32 object-contain mb-2"
            />
            <button className="bg-white text-black py-2 px-8 rounded-full font-medium hover:bg-gray-100 transition-colors">
              {option.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OneToOnePage;