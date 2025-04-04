import React, { createContext, useState, useContext, useEffect } from "react";

/**
 * 로딩 컨텍스트 타입 정의
 * 애플리케이션 전체에서 로딩 상태를 관리하기 위한 인터페이스
 *
 * @property {boolean} isLoading - 현재 로딩 중인지 여부
 * @property {function} setLoading - 로딩 상태를 설정하는 함수
 * @property {number} progress - 로딩 진행률 (0-100)
 * @property {function} setProgress - 로딩 진행률을 설정하는 함수
 * @property {function} completeLoading - 로딩을 즉시 완료 처리하는 함수
 */
interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  completeLoading: () => void;
}

/**
 * 로딩 컨텍스트 생성
 * 기본값은 모두 빈 함수와 초기 상태값으로 설정
 */
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
  progress: 0,
  setProgress: () => {},
  completeLoading: () => {},
});

/**
 * 로딩 컨텍스트 제공자 컴포넌트
 * 애플리케이션 전체에 로딩 상태 관리 기능을 제공
 *
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {JSX.Element} - 로딩 컨텍스트 제공자 컴포넌트
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [progress, setProgressState] = useState(0); // 진행률 상태

  /**
   * 안전장치: 로딩 상태가 30초 이상 지속되면 자동으로 해제
   * 무한 로딩 상태를 방지하기 위한 타임아웃 설정
   */
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setProgressState(100);
      }, 30000);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  /**
   * 진행률 상태 업데이트 함수
   * 로딩 중일 때만 진행률 업데이트를 허용하고, 100%에 도달하면 로딩 상태 자동 해제
   *
   * @param {number} newProgress - 새로운 진행률 값 (0-100)
   */
  const setProgress = (newProgress: number) => {
    // 로딩 중이 아니면 진행률 업데이트 무시
    if (!isLoading && newProgress !== 0) {
      return;
    }

    console.log(`진행률 업데이트: ${newProgress}%`);
    setProgressState(newProgress);

    // 진행률이 100%에 도달하면 로딩 상태 해제
    if (newProgress >= 100) {
      setIsLoading(false);
    }
  };

  /**
   * 로딩 상태 설정 함수
   * 로딩 시작 시 진행률을 0으로 초기화하고, 로딩 완료 시 진행률을 100%로 설정
   *
   * @param {boolean} loading - 설정할 로딩 상태
   */
  const setLoading = (loading: boolean) => {

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

  /**
   * 로딩 완료 함수
   * 로딩 상태를 즉시 완료 처리 (진행률 100%로 설정 및 로딩 상태 해제)
   */
  const completeLoading = () => {

    // 로딩 상태 즉시 해제
    setProgressState(100);
    setIsLoading(false);
  };

  // 컨텍스트 값 제공
  return <LoadingContext.Provider value={{ isLoading, setLoading, progress, setProgress, completeLoading }}>{children}</LoadingContext.Provider>;
};

/**
 * 로딩 컨텍스트 사용 훅
 * 컴포넌트에서 로딩 상태와 관련 함수에 쉽게 접근할 수 있도록 하는 커스텀 훅
 *
 * @returns {LoadingContextType} - 로딩 컨텍스트 값
 */
export const useLoading = () => useContext(LoadingContext);
