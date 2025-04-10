import { useState, useCallback } from "react";
import { useAiQuiz, QuizResponse } from "./useAiQuiz";

// useAiQuiz.ts에서 가져온 기존 인터페이스
interface QuizOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuizItem {
  quizId: number;
  question: string;
  options: QuizOption[];
}

// 섞인 옵션을 위한 확장된 인터페이스
export interface ShuffledQuizOption extends QuizOption {
  originalIndex: number; // 정답 제출 시 원래 위치를 추적하기 위함
}

export interface ShuffledQuizItem extends Omit<QuizItem, 'options'> {
  options: ShuffledQuizOption[];
  correctOptionIndex: number; // 섞인 후 정답 옵션의 인덱스
}

export const useShuffledQuiz = () => {
  const { loading, error, getLatestQuizContent, submitQuizAnswer, createQuizzes } = useAiQuiz();
  const [shuffledQuizzes, setShuffledQuizzes] = useState<ShuffledQuizItem[]>([]);

  // Fisher-Yates 셔플 알고리즘
  const shuffleArray = useCallback(<T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // 새 퀴즈를 생성하고 섞는 함수
  const createAndGetShuffledQuizzes = useCallback(async () => {
    try {
      // 1. 먼저 새 퀴즈를 생성 - 파라미터 없이 호출
      const createResponse = await createQuizzes();
      
      if (!createResponse.isSuccess) {
        console.error("새 퀴즈 생성에 실패했습니다:", createResponse.message);
        return {
          isSuccess: false,
          code: createResponse.code || 500,
          message: createResponse.message || "퀴즈 생성에 실패했습니다.",
          result: [] as ShuffledQuizItem[]
        };
      }
      
      // 2. 생성된 퀴즈 가져오기
      const response = await getLatestQuizContent();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // 각 퀴즈의 섞인 버전 생성
        const shuffled = response.result.map((quiz: QuizItem) => {
          // 셔플하기 전에 각 옵션에 원래 인덱스 추가
          const optionsWithIndex = quiz.options.map((option, index) => ({
            ...option,
            originalIndex: index
          }));

          // 옵션 섞기
          const shuffledOptions = shuffleArray(optionsWithIndex);
          
          // 섞은 후 정답 옵션의 인덱스 찾기
          const correctOptionIndex = shuffledOptions.findIndex(option => option.isCorrect);
          
          return {
            ...quiz,
            options: shuffledOptions,
            correctOptionIndex
          };
        });
        
        setShuffledQuizzes(shuffled);
        return {
          ...response,
          result: shuffled
        };
      }
      
      return response;
    } catch (error) {
      console.error("퀴즈를 생성하고 섞는 중 오류 발생:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "퀴즈 데이터를 가져오는데 실패했습니다.",
        result: [] as ShuffledQuizItem[]
      };
    }
  }, [createQuizzes, getLatestQuizContent, shuffleArray]);

  // 기존 코드를 유지하되, 새로운 함수 추가
  const getShuffledQuizzes = useCallback(async () => {
    try {
      const response = await getLatestQuizContent();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // 각 퀴즈의 섞인 버전 생성
        const shuffled = response.result.map((quiz: QuizItem) => {
          // 셔플하기 전에 각 옵션에 원래 인덱스 추가
          const optionsWithIndex = quiz.options.map((option, index) => ({
            ...option,
            originalIndex: index
          }));

          // 옵션 섞기
          const shuffledOptions = shuffleArray(optionsWithIndex);
          
          // 섞은 후 정답 옵션의 인덱스 찾기
          const correctOptionIndex = shuffledOptions.findIndex(option => option.isCorrect);
          
          return {
            ...quiz,
            options: shuffledOptions,
            correctOptionIndex
          };
        });
        
        setShuffledQuizzes(shuffled);
        return {
          ...response,
          result: shuffled
        };
      }
      
      return response;
    } catch (error) {
      console.error("퀴즈를 가져오고 섞는 중 오류 발생:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "퀴즈 데이터를 가져오는데 실패했습니다.",
        result: [] as ShuffledQuizItem[]
      };
    }
  }, [getLatestQuizContent, shuffleArray]);

  // 섞인 퀴즈에 대한 정답 제출 함수
  const submitShuffledQuizAnswer = useCallback(async (quizId: number, selectedShuffledIndex: number) => {
    // 선택한 퀴즈 찾기
    const quiz = shuffledQuizzes.find(q => q.quizId === quizId);
    if (!quiz) {
      console.error("선택한 퀴즈를 찾을 수 없습니다.");
      return {
        isSuccess: false,
        code: 400,
        message: "선택한 퀴즈를 찾을 수 없습니다.",
        result: false
      };
    }

    // 선택한 섞인 인덱스에 해당하는 원래 인덱스 가져오기
    const originalIndex = quiz.options[selectedShuffledIndex].originalIndex;
    
    // 원래 인덱스를 사용하여 정답 제출
    return await submitQuizAnswer(quizId, originalIndex);
  }, [shuffledQuizzes, submitQuizAnswer]);

  return {
    loading,
    error,
    shuffledQuizzes,
    getShuffledQuizzes,
    createAndGetShuffledQuizzes,
    submitShuffledQuizAnswer
  };
};