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

// 카테고리 타입 정의 - tag 속성 명시적으로 추가
export interface Category {
  id: number;
  tag: string; // 태그 속성 추가
  name: string;
  problems: Problem[];
  totalProblems?: number;
}

// 컴포넌트 props 타입 정의
export interface AnalysisProps {
  onDetailView?: () => void; // optional로 변경
  categories: Category[];
  onStartGame?: () => void;
}