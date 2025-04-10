import { useState, useEffect } from 'react';
import { useApi } from './useApi';

// 오답 노트 인터페이스
export interface WrongQuizItem {
  quizId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
}

// 모든 풀이 기록 인터페이스
export interface QuizItem {
  quizId: number;
  question: string;
  options: {
    optionId: number;
    optionText: string;
    isCorrect: boolean;
  }[];
}

// 계산된 퀴즈 요약 정보
export interface QuizSummary {
  totalQuizzes: number;     // 총 퀴즈 수
  wrongQuizzes: number;     // 틀린 퀴즈 수
  correctRate: number;      // 정답률
  weakPoints: WeakPoint[];  // 취약점
}

export interface WeakPoint {
  id: number;
  topic: string;
  level: "high" | "medium" | "low";
}

export const useAiQuizSummary = () => {
  const [summary, setSummary] = useState<QuizSummary>({
    totalQuizzes: 0,
    wrongQuizzes: 0,
    correctRate: 0,
    weakPoints: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출을 위한 useApi 훅 사용
  const { execute: fetchWrongQuizzes } = useApi<{ result: WrongQuizItem[] }>("/api/ai/consumption/wrong", "GET");
  const { execute: fetchAllQuizzes } = useApi<{ result: QuizItem[] }>("/api/ai/consumption/monthly", "GET");

  // 데이터 분석 및 요약 처리 함수
  const processQuizData = (wrongQuizzes: WrongQuizItem[], allQuizzes: QuizItem[]) => {
    // 기본 정보 계산
    const wrongCount = wrongQuizzes.length;
    const totalCount = allQuizzes.length;
    
    // 정답률 계산 (퀴즈가 있을 경우에만)
    const correctRate = totalCount > 0 
      ? ((totalCount - wrongCount) / totalCount) * 100 
      : 0;
    
    // 취약점 분석 (여기서는 간단하게 카테고리화)
    const topics = analyzeMistakePatterns(wrongQuizzes);
    
    setSummary({
      totalQuizzes: totalCount,
      wrongQuizzes: wrongCount,
      correctRate: correctRate,
      weakPoints: topics
    });
  };

  // 취약점 분석 함수 (오답 패턴 기반)
  const analyzeMistakePatterns = (wrongQuizzes: WrongQuizItem[]): WeakPoint[] => {
    // 실제 앱에서는 더 복잡한 분석 로직이 필요할 수 있습니다
    // 여기서는 간단한 예시로 구현합니다
    
    // 예시: 문제 내용에 특정 키워드가 포함된 경우 카테고리화
    const patterns = [
      { keywords: ['예산', '지출', '저축'], topic: '예산 관리' },
      { keywords: ['투자', '수익', '주식', '펀드'], topic: '투자 지식' },
      { keywords: ['카드', '신용', '결제'], topic: '카드 사용' },
      { keywords: ['이자', '대출', '상환'], topic: '대출 관리' },
      { keywords: ['소비', '구매', '쇼핑'], topic: '소비 습관' }
    ];
    
    // 각 패턴이 오답에서 발견된 횟수 카운팅
    const topicCounts: Record<string, number> = {};
    
    wrongQuizzes.forEach(quiz => {
      patterns.forEach(pattern => {
        const hasKeyword = pattern.keywords.some(keyword => 
          quiz.question.includes(keyword) || 
          (quiz.correctAnswer && quiz.correctAnswer.includes(keyword))
        );
        
        if (hasKeyword) {
          topicCounts[pattern.topic] = (topicCounts[pattern.topic] || 0) + 1;
        }
      });
    });
    
    // 결과 객체 생성
    let result: WeakPoint[] = Object.entries(topicCounts)
      .map(([topic, count], index) => {
        // 레벨 결정 (카운트가 높을수록 취약도가 높음)
        let level: "high" | "medium" | "low" = "low";
        
        if (count >= 3) {
          level = "high";
        } else if (count >= 2) {
          level = "medium";
        }
        
        return {
          id: index + 1,
          topic,
          level
        };
      })
      .sort((a, b) => {
        // high > medium > low 순으로 정렬
        const levelOrder = { high: 3, medium: 2, low: 1 };
        return levelOrder[b.level] - levelOrder[a.level];
      });
    
    // 취약점이 없을 경우 기본값 제공
    if (result.length === 0 && wrongQuizzes.length > 0) {
      result.push({
        id: 1,
        topic: "금융 지식 일반",
        level: "low"
      });
    }
    
    // 각 레벨별로 하나씩만 선택하여 3개를 만듦
    const finalResult: WeakPoint[] = [];
    
    // 높음 레벨에서 1개 선택
    const highItem = result.find(item => item.level === "high");
    if (highItem) {
      finalResult.push(highItem);
    } else {
      // 높음 레벨이 없으면 더미 데이터 추가
      finalResult.push({
        id: 100,
        topic: "금융 상품의 위험성 이해",
        level: "high"
      });
    }
    
    // 중간 레벨에서 1개 선택
    const mediumItem = result.find(item => item.level === "medium");
    if (mediumItem) {
      finalResult.push(mediumItem);
    } else {
      // 중간 레벨이 없으면 더미 데이터 추가
      finalResult.push({
        id: 101,
        topic: "투자 수익률 계산",
        level: "medium"
      });
    }
    
    // 낮음 레벨에서 1개 선택
    const lowItem = result.find(item => item.level === "low");
    if (lowItem) {
      finalResult.push(lowItem);
    } else {
      // 낮음 레벨이 없으면 더미 데이터 추가
      finalResult.push({
        id: 102,
        topic: "시장 위험 분석",
        level: "low"
      });
    }
    
    return finalResult;
  };

  // 데이터 로드 함수
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 두 API를 동시에 호출
      const [wrongResponse, allResponse] = await Promise.all([
        fetchWrongQuizzes(),
        fetchAllQuizzes()
      ]);
      
      if (wrongResponse.isSuccess && allResponse.isSuccess) {
        const wrongQuizzes = wrongResponse.result || [];
        const allQuizzes = allResponse.result || [];
        
        processQuizData(wrongQuizzes as WrongQuizItem[], allQuizzes as QuizItem[]);
      } else {
        setError("데이터 로드 실패");
      }
    } catch (err) {
      console.error("퀴즈 데이터 로드 오류:", err);
      setError("데이터 로드 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 새로고침 함수
  const refreshData = () => {
    loadData();
  };

  return {
    summary,
    loading,
    error,
    refreshData
  };
};

export default useAiQuizSummary;