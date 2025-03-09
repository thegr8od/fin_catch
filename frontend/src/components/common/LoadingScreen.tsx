import React, { useState, useEffect, useRef } from "react";
import { useLoading } from "../../contexts/LoadingContext";

interface LoadingScreenProps {
  customMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ customMessage }) => {
  const { isLoading, progress } = useLoading();
  const [visible, setVisible] = useState(false);
  const prevLoadingRef = useRef(false);

  // 로딩 상태 변경 감지
  useEffect(() => {
    // 로딩 상태 변경 로그
    if (prevLoadingRef.current !== isLoading) {
      console.log(`로딩 상태 변경: ${prevLoadingRef.current} -> ${isLoading}`);
      prevLoadingRef.current = isLoading;
    }

    if (isLoading) {
      console.log("로딩 화면 표시");
      setVisible(true);
    } else {
      console.log("로딩 화면 숨김");
      // 로딩이 끝나면 즉시 숨김
      setVisible(false);
    }

    // 안전장치: 로딩 상태가 true인데 30초 이상 지속되면 강제로 숨김
    if (isLoading) {
      const forceHideTimer = setTimeout(() => {
        console.log("로딩 화면 30초 타임아웃으로 강제 숨김");
        setVisible(false);
      }, 30000);

      return () => clearTimeout(forceHideTimer);
    }
  }, [isLoading]);

  // 화면에 표시되지 않을 때는 렌더링하지 않음
  if (!visible) {
    return null;
  }

  // 진행률이 0인 경우 "준비 중..." 메시지 표시
  const loadingMessage = progress === 0 ? "게임 준비 중..." : customMessage || "게임 리소스 로딩 중...";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
      style={{
        zIndex: 9999, // 매우 높은 z-index 값 설정
      }}
      data-testid="loading-screen" // 테스트용 ID 추가
      onClick={() => {
        // 디버깅용: 로딩 화면 클릭 시 로그 출력
        console.log("로딩 화면 클릭됨, 현재 상태:", { isLoading, progress, visible });
      }}
    >
      <div className="text-center w-80">
        <div className="w-16 h-16 mx-auto border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

        <h2 className="mt-4 text-2xl font-bold text-white">{loadingMessage}</h2>
        <div className="mt-4 w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{
              width: `${Math.max(1, Math.min(100, Math.round(progress)))}%`,
            }}
          />
        </div>
        <p className="mt-2 text-gray-300">{Math.round(progress)}% 완료</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
