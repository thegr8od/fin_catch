import { Category } from "../types/analysis/Problem";

export const dummyWrongAnswerCategories: Category[] = [
  {
    id: 1,
    tag: "finance_committee",
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
    tag: "financial_crime",
    name: "금융 범죄",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 3,
    tag: "financial_products",
    name: "금융 상품",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 4,
    tag: "investment",
    name: "투자",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 5,
    tag: "financial_knowledge",
    name: "금융 지식",
    totalProblems: 30,
    problems: [],
  },
];

// 수정된 퀴즈 결과 데이터
export const dummyQuizScores = {
  totalProblems: 10,   // 총 문제 수
  correctAnswers: 8,   // 맞힌 문제 수
  finalScore: 400      // 최종 점수
};

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