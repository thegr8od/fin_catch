import React, { useState, useEffect, useRef } from "react";
import { useLoading } from "../../contexts/LoadingContext";

/**
 * 로딩 화면 컴포넌트 Props 인터페이스
 * @property {string} customMessage - 선택적 커스텀 로딩 메시지
 */
interface LoadingScreenProps {
  customMessage?: string;
}

/**
 * 로딩 화면 컴포넌트
 * 애플리케이션 전체에서 사용되는 로딩 인디케이터를 표시
 * 로딩 상태와 진행률을 시각적으로 표현
 *
 * @param {LoadingScreenProps} props - 컴포넌트 props
 * @returns {JSX.Element | null} - 로딩 화면 또는 null(표시되지 않을 때)
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ customMessage }) => {
  const { isLoading, progress } = useLoading(); // 로딩 컨텍스트에서 상태 가져오기
  const [visible, setVisible] = useState(false); // 화면 표시 여부 상태
  const prevLoadingRef = useRef(false); // 이전 로딩 상태 참조 (변경 감지용)

  /**
   * 로딩 상태 변경 감지 및 화면 표시 제어
   * 로딩 상태가 true로 변경되면 화면 표시, false로 변경되면 화면 숨김
   * 안전장치로 30초 이상 로딩 상태가 지속되면 강제로 화면 숨김
   */
  useEffect(() => {
    // 로딩 상태 변경 로그
    if (prevLoadingRef.current !== isLoading) {
      prevLoadingRef.current = isLoading;
    }

    if (isLoading) {
      setVisible(true);
    } else {
      // 로딩이 끝나면 즉시 숨김
      setVisible(false);
    }

    // 안전장치: 로딩 상태가 true인데 30초 이상 지속되면 강제로 숨김
    if (isLoading) {
      const forceHideTimer = setTimeout(() => {
        setVisible(false);
      }, 30000);

      return () => clearTimeout(forceHideTimer);
    }
  }, [isLoading]);

  // 화면에 표시되지 않을 때는 렌더링하지 않음 (성능 최적화)
  if (!visible) {
    return null;
  }

  // 진행률이 0인 경우 "준비 중..." 메시지 표시, 그 외에는 커스텀 메시지 또는 기본 메시지 표시
  const loadingMessage = progress === 0 ? "게임 준비 중..." : customMessage || "게임 리소스 로딩 중...";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
      style={{
        zIndex: 9999, // 매우 높은 z-index 값 설정 (다른 모든 요소 위에 표시)
      }}
      data-testid="loading-screen" // 테스트용 ID 추가
      onClick={() => {
        // 디버깅용: 로딩 화면 클릭 시 로그 출력
        console.log("로딩 화면 클릭됨, 현재 상태:", { isLoading, progress, visible });
      }}
    >
      <div className="text-center w-80">
        {/* 로딩 스피너 */}
        <div className="w-16 h-16 mx-auto border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

        {/* 로딩 메시지 */}
        <h2 className="mt-4 text-2xl font-bold text-white">{loadingMessage}</h2>

        {/* 진행률 바 */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{
              width: `${Math.max(1, Math.min(100, Math.round(progress)))}%`, // 1~100% 범위로 제한
            }}
          />
        </div>

        {/* 진행률 텍스트 */}
        <p className="mt-2 text-gray-300">{Math.round(progress)}% 완료</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
