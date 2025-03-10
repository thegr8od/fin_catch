import React, { createContext, useState, useContext, useEffect } from "react";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  completeLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
  progress: 0,
  setProgress: () => {},
  completeLoading: () => {},
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgressState] = useState(0);

  // 안전장치: 로딩 상태가 30초 이상 지속되면 자동으로 해제
  useEffect(() => {
    if (isLoading) {
      console.log("로딩 상태 활성화됨, 30초 타임아웃 설정");
      const timeoutId = setTimeout(() => {
        console.log("로딩 상태 30초 타임아웃으로 자동 해제");
        setIsLoading(false);
        setProgressState(100);
      }, 30000);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  // 진행률 상태 업데이트 함수
  const setProgress = (newProgress: number) => {
    // 로딩 중이 아니면 진행률 업데이트 무시
    if (!isLoading && newProgress !== 0) {
      console.log(`진행률 업데이트 무시 (로딩 중 아님): ${newProgress}%`);
      return;
    }

    console.log(`진행률 업데이트: ${newProgress}%`);
    setProgressState(newProgress);

    // 진행률이 100%에 도달하면 로딩 상태 해제
    if (newProgress >= 100) {
      console.log("진행률 100% 도달, 로딩 상태 자동 해제");
      setIsLoading(false);
    }
  };

  // 로딩 상태 설정 함수
  const setLoading = (loading: boolean) => {
    console.log(`로딩 상태 설정: ${loading}`);

    if (loading) {
      // 로딩 시작
      setProgressState(0);
      setIsLoading(true);
    } else {
      // 로딩 완료
      setProgressState(100);
      setIsLoading(false);
    }
  };

  // 로딩 완료 함수
  const completeLoading = () => {
    console.log("로딩 완료 함수 호출됨");

    // 로딩 상태 즉시 해제
    setProgressState(100);
    setIsLoading(false);
  };

  return <LoadingContext.Provider value={{ isLoading, setLoading, progress, setProgress, completeLoading }}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => useContext(LoadingContext);
