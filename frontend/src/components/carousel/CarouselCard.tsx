import React from "react";

interface CarouselCardProps {
  title: string;
  description: string;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

const CarouselCard: React.FC<CarouselCardProps> = ({ title, description, image, isSelected, onClick }) => {
  return (
    <div className={`cursor-pointer transition-all duration-300 rounded-lg overflow-hidden ${isSelected ? "transform scale-105" : ""}`} onClick={onClick} style={{ width: "100%", height: "100%" }}>
      {/* 이미지 */}
      <div className="w-full h-3/5 bg-white flex items-center justify-center">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* 텍스트 영역 */}
      <div className="w-full h-2/5 bg-carousel-color opacity-90 p-6 flex flex-col justify-center">
        <h3 className="text-xl text-center mb-4 text-black font-korean-pixel">{title}</h3>
        <p className="text-base text-center text-black font-korean-pixel">{description}</p>
      </div>
    </div>
  );
};

export default CarouselCard;
