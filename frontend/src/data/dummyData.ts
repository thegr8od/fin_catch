import { Category } from "../types/analysis/Problem";

export const dummyWrongAnswerCategories: Category[] = [
  {
    id: 1,
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
    name: "금융 범죄",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 3,
    name: "금융 상품",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 4,
    name: "투자",
    totalProblems: 30,
    problems: [],
  },
  {
    id: 5,
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

export const dummyWeakPoints = [
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
