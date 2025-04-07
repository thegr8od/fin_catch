export type SpendingCategory = "FOOD" | "TRANSPORT" | "HOUSING" | "MEDICAL" | "CULTURE" | "SHOPPING" | "EDUCATION" | "ETC";

export type SpendingAnalysis = {
  [key in SpendingCategory]?: number;
};

// 카테고리별 색상 및 이름 매핑
export const CATEGORY_COLORS: Record<SpendingCategory, string> = {
  FOOD: "#4F46E5", // 인디고
  TRANSPORT: "#10B981", // 에메랄드
  HOUSING: "#F59E0B", // 앰버
  MEDICAL: "#EF4444", // 레드
  CULTURE: "#8B5CF6", // 바이올렛
  SHOPPING: "#EC4899", // 핑크
  EDUCATION: "#3B82F6", // 블루
  ETC: "#6B7280", // 그레이
};

export const CATEGORY_NAMES: Record<SpendingCategory, string> = {
  FOOD: "식비",
  TRANSPORT: "교통",
  HOUSING: "주거",
  MEDICAL: "의료",
  CULTURE: "문화",
  SHOPPING: "쇼핑",
  EDUCATION: "교육",
  ETC: "기타",
};
