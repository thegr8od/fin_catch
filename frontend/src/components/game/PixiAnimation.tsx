import React, { useEffect, useRef, useState } from "react";
import { usePixiAnimation } from "../../hooks/usePixiAnimation";

interface PixiAnimationProps {
  isPlaying: boolean;
  imagePaths: string[]; // 이미지 경로 배열
  animationSpeed?: number; // 애니메이션 속도 (기본값: 0.2)
  onAnimationComplete?: () => void;
  onHitLeft?: () => void; // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  direction?: boolean; // 애니메이션 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  width?: number; // 컨테이너 너비
  height?: number; // 컨테이너 높이
}

const PixiAnimation: React.FC<PixiAnimationProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef<boolean>(true);

  // 직접 이미지 로드 확인
  useEffect(() => {
    if (props.imagePaths && props.imagePaths.length > 0) {
      const img = new Image();
      img.onload = () => {
        console.log("이미지 직접 로드 성공:", props.imagePaths[0]);
      };
      img.onerror = (e) => {
        console.error("이미지 직접 로드 실패:", props.imagePaths[0], e);
      };
      img.src = props.imagePaths[0];
    }
  }, [props.imagePaths]);

  const { isLoaded, initializeApp, playAnimation, cleanup, appRef } = usePixiAnimation({
    imagePaths: props.imagePaths,
    animationSpeed: props.animationSpeed,
    onAnimationComplete: props.onAnimationComplete,
    onHitLeft: props.onHitLeft,
    onHitRight: props.onHitRight,
    direction: props.direction,
    width: props.width,
    height: props.height,
  });

  // 컴포넌트 마운트 시 앱 초기화
  useEffect(() => {
    if (isLoaded && containerRef.current && mountedRef.current) {
      try {
        console.log("앱 초기화 시도");
        const app = initializeApp(containerRef.current);

        // 초기화 성공 여부와 관계없이 일정 시간 후 준비 완료 상태로 변경
        setTimeout(() => {
          if (mountedRef.current) {
            setIsReady(true);
            console.log("애니메이션 준비 완료 (강제)");
          }
        }, 1000);
      } catch (error) {
        console.error("애니메이션 초기화 중 오류:", error);
        // 오류가 발생해도 일정 시간 후 준비 완료 상태로 변경
        setTimeout(() => {
          if (mountedRef.current) {
            setIsReady(true);
            console.log("애니메이션 준비 완료 (오류 후 강제)");
          }
        }, 1000);
      }
    }
  }, [isLoaded, initializeApp]);

  // 재생 상태 변경 시 애니메이션 제어
  useEffect(() => {
    if (isReady && mountedRef.current) {
      try {
        console.log("애니메이션 재생 상태 변경:", props.isPlaying);
        playAnimation(props.isPlaying);
      } catch (error) {
        console.error("애니메이션 재생 중 오류:", error);
      }
    }
  }, [props.isPlaying, playAnimation, isReady]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try {
        cleanup();
      } catch (error) {
        console.error("리소스 정리 중 오류:", error);
      }
    };
  }, [cleanup]);

  // 일정 시간 후 강제로 로딩 상태 해제
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady && mountedRef.current) {
        setIsReady(true);
        console.log("타임아웃으로 인한 강제 로딩 완료");
      }
    }, 3000); // 3초 후 강제 로딩 완료

    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <div className="relative w-full h-full">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent" style={{ opacity: 1 }} />
      {/* 폴백 이미지 - 애니메이션이 실패할 경우 표시 */}
      {isReady && props.imagePaths && props.imagePaths.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 0.5,
            pointerEvents: "none",
            backgroundImage: `url(${props.imagePaths[0]})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      )}
    </div>
  );
};

export default PixiAnimation;
