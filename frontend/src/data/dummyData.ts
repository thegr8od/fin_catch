import { Category } from "../types/analysis/Problem";

// WeakPoint 인터페이스 정의
export interface WeakPoint {
  id: number;
  topic: string;
  level: "high" | "medium" | "low"; // 문자열 리터럴 타입으로 제한
  category?: string;
  count?: number;
}

export const dummyWrongAnswerCategories: Category[] = [
  {
    id: 1,
    tag: "finance_committee", // tag 필드 추가
    name: "금융통화위원회의 역할",
    totalProblems: 5,
    problems: [
      {
        id: 151,
        title: "금융통화위원회의 역할",
        type: "객관식" as const,
        wrongCount: 3,
        correctCount: 2,
        analysis: "",
        attemptHistory: [
          { date: "2024-02-01", isCorrect: false },
          { date: "2024-02-03", isCorrect: true },
          { date: "2024-02-05", isCorrect: false },
        ],
        weakPoints: [],
        recommendations: [],
      },
    ],
  },
  {
    id: 2,
    tag: "financial_crime", // tag 필드 추가
    name: "금융 범죄",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 3,
    tag: "financial_products", // tag 필드 추가
    name: "금융 상품",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 4,
    tag: "investment", // tag 필드 추가
    name: "투자",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 5,
    tag: "financial_knowledge", // tag 필드 추가
    name: "금융 지식",
    totalProblems: 30,
    problems: [],
  },
];

export const dummyQuizScores = {
  average: 85,
  totalAttempts: 10,
  consecutiveDays: 3,
};

export const dummyWeakPoints: WeakPoint[] = [
  {
    id: 1,
    topic: "금융상품의 위험성 이해",
    level: "high", // 문자열 리터럴 타입으로 지정
    category: "금융 상품",
    count: 5
  },
  {
    id: 2,
    topic: "투자 수익률 계산",
    level: "medium", // 문자열 리터럴 타입으로 지정
    category: "투자",
    count: 3
  },
  {
    id: 3,
    topic: "시장 위험 분석",
    level: "low", // 문자열 리터럴 타입으로 지정
    category: "금융 지식",
    count: 2
  },
];