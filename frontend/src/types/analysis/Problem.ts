// 문제 타입 정의
export interface Problem {
  id: number;
  title: string;
  type: "객관식" | "주관식" | "서술형";
  wrongCount: number;
  correctCount: number;
  analysis: string;
  attemptHistory: {
    date: string;
    isCorrect: boolean;
  }[];
  weakPoints: string[];
  recommendations: string[];
}

// 카테고리 타입 정의
export interface Category {
  id: number;
  tag: string; // 필수 속성으로 추가
  name: string;
  problems: Problem[];
  totalProblems?: number;
}

// 컴포넌트 props 타입 정의
export interface AnalysisProps {
  onDetailView?: () => void;
  categories: Category[];
  onStartGame?: () => void;
  onStartAiQuiz?: () => void | Promise<void>; // MainPage.tsx의 타입 에러 해결을 위해 추가
}