import React from 'react';
import { Category } from '../../types/analysis/Problem';

interface CategoryButtonsProps {
  categories: Category[];
  selectedCategory: number | string;
  regularCategory: Category | null;
  consumptionCategory: Category | null;
  onCategorySelect: (categoryId: number | string) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  categories,
  selectedCategory,
  regularCategory,
  consumptionCategory,
  onCategorySelect
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* 기존 카테고리 버튼들 */}
      {categories.map((category) => (
        <button
          key={category.tag}
          onClick={() => onCategorySelect(category.tag)}
          className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${
            selectedCategory === category.tag 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          {category.name}
          {category.totalProblems && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {category.problems.length}/{category.totalProblems}
            </span>
          )}
        </button>
      ))}
      
      {/* 일반 퀴즈 버튼 - 항상 표시 */}
      <button
        key="regular"
        onClick={() => onCategorySelect("regular")}
        className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${
          selectedCategory === "regular" 
            ? "bg-blue-500 text-white" 
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        문제 오답
        {regularCategory && regularCategory.problems.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {regularCategory.problems.length}
          </span>
        )}
      </button>
      
      {/* AI 소비 퀴즈 버튼 - 항상 표시 */}
      <button
        key="consumption"
        onClick={() => onCategorySelect("consumption")}
        className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${
          selectedCategory === "consumption" 
            ? "bg-blue-500 text-white" 
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        소비 퀴즈 오답
        {consumptionCategory && consumptionCategory.problems.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {consumptionCategory.problems.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default CategoryButtons;