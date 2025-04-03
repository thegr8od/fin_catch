import { Category } from "../types/analysis/Problem";

// 각 카테고리에 tag 속성 추가
export const dummyWrongAnswerCategories: Category[] = [
  {
    id: 1,
    tag: "financial_committee", // tag 속성 추가
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
    tag: "financial_crime", // tag 속성 추가
    name: "금융 범죄",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 3,
    tag: "financial_products", // tag 속성 추가
    name: "금융 상품",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 4,
    tag: "investment", // tag 속성 추가
    name: "투자",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 5,
    tag: "financial_knowledge", // tag 속성 추가
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

// 취약점 인터페이스 정의 및 export
export interface WeakPoint {
  id: number;
  topic: string;
  level: "high" | "medium" | "low";
}

export const dummyWeakPoints: WeakPoint[] = [
  {
    id: 1,
    topic: "금융상품의 위험성 이해",
    level: "high" as const,
  },
  {
    id: 2,
    topic: "투자 수익률 계산",
    level: "medium" as const,
  },
  {
    id: 3,
    topic: "시장 위험 분석",
    level: "low" as const,
  },
];