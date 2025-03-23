import { useState, useMemo, useCallback } from "react";
import { CharacterType } from "../components/game/constants/animations";

interface Character {
  catId: number;
  catName: CharacterType;
  description: string;
  grade: string;
}

export const useCharacterPagination = (characters: Character[], itemsPerPage: number = 4) => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(characters.length / itemsPerPage);

  const currentCharacters = useMemo(() => {
    return characters.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  }, [characters, currentPage, itemsPerPage]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    currentCharacters,
    handlePrevPage,
    handleNextPage,
  };
};
