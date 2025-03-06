import React from "react";

export type Difficulty = "초급" | "중급" | "고급";

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selectedDifficulty, onSelectDifficulty }) => {
  const difficulties: Difficulty[] = ["초급", "중급", "고급"];

  return (
    <div className="flex justify-center space-x-4">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty}
          className={`px-6 py-1 rounded-md transition-all font-korean-pixel ${
            selectedDifficulty === difficulty ? "bg-[#3490dc] text-white" : "bg-pink-200 bg-opacity-30 text-white hover:bg-opacity-40"
          }`}
          onClick={() => onSelectDifficulty(difficulty)}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
