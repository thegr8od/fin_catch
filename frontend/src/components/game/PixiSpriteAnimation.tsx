import React, { useEffect, useRef, useState } from "react";
import { usePixiSpriteAnimation } from "../../hooks/usePixiSpriteAnimation";

interface PixiSpriteAnimationProps {
  isPlaying: boolean;
  spriteSheet: string; // 스프라이트 시트 이미지 경로
  frameWidth: number; // 각 프레임의 너비
  frameHeight: number; // 각 프레임의 높이
  frameCount: number; // 총 프레임 수
  animationSpeed?: number; // 애니메이션 속도 (기본값: 0.2)
  onAnimationComplete?: () => void;
  onHitLeft?: () => void; // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  direction?: boolean; // 애니메이션 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  width?: number; // 컨테이너 너비
  height?: number; // 컨테이너 높이
  horizontal?: boolean; // 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
  rows?: number; // 스프라이트 시트의 행 수 (세로 배열일 때 사용)
  columns?: number; // 스프라이트 시트의 열 수 (가로 배열일 때 사용)
  loop?: boolean; // 애니메이션 반복 여부
  moving?: boolean; // 이동 애니메이션 여부 (false일 경우 제자리 애니메이션)
}

const PixiSpriteAnimation: React.FC<PixiSpriteAnimationProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef<boolean>(true);

  // 직접 이미지 로드 확인
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log("이미지 직접 로드 성공:", props.spriteSheet);
    };
    img.onerror = (e) => {
      console.error("이미지 직접 로드 실패:", props.spriteSheet, e);
    };
    img.src = props.spriteSheet;
  }, [props.spriteSheet]);

  const { isLoaded, initializeApp, playAnimation, cleanup, appRef } = usePixiSpriteAnimation({
    spriteSheet: props.spriteSheet,
    frameWidth: props.frameWidth,
    frameHeight: props.frameHeight,
    frameCount: props.frameCount,
    animationSpeed: props.animationSpeed,
    onAnimationComplete: props.onAnimationComplete,
    onHitLeft: props.onHitLeft,
    onHitRight: props.onHitRight,
    direction: props.direction,
    width: props.width,
    height: props.height,
    horizontal: props.horizontal,
    rows: props.rows,
    columns: props.columns,
    loop: props.loop,
    moving: props.moving,
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
      {isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 0.5,
            pointerEvents: "none",
            backgroundImage: `url(${props.spriteSheet})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      )}
    </div>
  );
};

export default PixiSpriteAnimation;
