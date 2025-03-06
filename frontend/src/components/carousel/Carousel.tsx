import React, { useState, useEffect } from "react";
import CarouselCard from "./CarouselCard";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface CarouselProps {
  items: CarouselItem[];
  onSelect: (item: CarouselItem) => void;
}

const Carousel: React.FC<CarouselProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 첫 번째 아이템 선택
    if (items.length > 0) {
      onSelect(items[0]);
    }
  }, [items, onSelect]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onSelect(items[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onSelect(items[newIndex]);
    }
  };

  return (
    <div className="relative w-full flex justify-center items-center">
      <div className="flex justify-center items-center h-[550px] w-full">
        {/* 이전 버튼 */}
        <button
          className="text-white text-4xl font-bold z-20 w-16 h-16 flex items-center justify-center absolute left-4"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          &lt;
        </button>

        {/* 카드 컨테이너 */}
        <div className="flex justify-center items-center w-[70%]">
          {/* 현재 카드 */}
          <div className="w-full h-[550px]">
            <CarouselCard title={items[currentIndex].title} description={items[currentIndex].description} image={items[currentIndex].image} isSelected={true} onClick={() => {}} />
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          className="text-white text-4xl font-bold z-20 w-16 h-16 flex items-center justify-center absolute right-4"
          onClick={handleNext}
          disabled={currentIndex === items.length - 1}
          style={{ opacity: currentIndex === items.length - 1 ? 0.5 : 1 }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Carousel;
