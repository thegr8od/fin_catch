import React from "react";

interface ModeCardProps {
  title: string;
  description: string;
  imageSrc: string;
  isSelected: boolean;
  onClick: () => void;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  selectedBorderColor?: string;
}

const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  imageSrc,
  isSelected,
  onClick,
  bgColor = "bg-form-color",
  textColor = "text-black",
  borderColor = "border-gray-600",
  selectedBorderColor = "border-yellow-400",
}) => {
  return (
    <div
      className={`${bgColor} backdrop-blur-sm rounded-lg border-4 ${
        isSelected ? selectedBorderColor : borderColor
      } w-full pixel-border cursor-pointer transition-all hover:transform hover:scale-105 overflow-hidden flex flex-col`}
      onClick={onClick}
    >
      <div className="w-full h-40 overflow-hidden">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col items-center">
        <h3 className={`text-xl text-center ${textColor} font-korean-pixel`}>{title}</h3>
        <p className={`${textColor} opacity-80 text-sm text-center mt-2 font-korean-pixel`}>{description}</p>
      </div>
    </div>
  );
};

export default ModeCard;
