import { useState, useEffect } from 'react';

export interface QuizScores {
  totalProblems: number;
  correctAnswers: number;
  finalScore: number;
}

export const useQuizResult = () => {
  const [quizScores, setQuizScores] = useState<QuizScores>({
    totalProblems: 0,
    correctAnswers: 0,
    finalScore: 0
  });

  // 컴포넌트 마운트 시 로컬 스토리지에서 결과 로드
  useEffect(() => {
    const loadQuizResult = () => {
      const savedResult = localStorage.getItem('lastQuizResult');
      if (savedResult) {
        setQuizScores(JSON.parse(savedResult));
      }
    };

    loadQuizResult();
  }, []);

  // 퀴즈 결과 저장하는 함수
  const saveQuizResult = (result: QuizScores) => {
    localStorage.setItem('lastQuizResult', JSON.stringify(result));
    setQuizScores(result);
  };

  // 퀴즈 결과 초기화 함수
  const resetQuizResult = () => {
    localStorage.removeItem('lastQuizResult');
    setQuizScores({
      totalProblems: 0,
      correctAnswers: 0,
      finalScore: 0
    });
  };

  return {
    quizScores,
    saveQuizResult,
    resetQuizResult
  };
};

export default useQuizResult;