import React, { useEffect, useRef, useState } from "react";
import { useGameAnimation, AnimationState, AnimationOptions, SpriteSheetOptions, ImageSequenceOptions } from "../../hooks/useGameAnimation";

interface GameAnimationProps {
  isPlaying: boolean;
  hp?: number; // 캐릭터 HP (0 이하면 사망 애니메이션 재생)
  timeRemaining?: number; // 남은 시간 (0 이하면 게임 종료 애니메이션 재생)
  className?: string; // 추가 클래스명
  type: "spriteSheet" | "imageSequence";
  spriteSheet?: string;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
  imagePaths?: string[];
  animationSpeed?: number;
  loop?: boolean;
  moving?: boolean;
  direction?: boolean;
  width?: number;
  height?: number;
  horizontal?: boolean;
  rows?: number;
  columns?: number;
  onAnimationComplete?: () => void;
  onHitLeft?: () => void;
  onHitRight?: () => void;
  onGameOver?: () => void;
  initialState?: AnimationState;
  hitAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
  deadAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
  victoryAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
  gameOverAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
}

const GameAnimation: React.FC<GameAnimationProps> = (props) => {
  const { isPlaying, hp, timeRemaining, className = "", ...restProps } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef<boolean>(true);

  // AnimationOptions 객체 생성
  const createAnimationOptions = (): AnimationOptions => {
    if (props.type === "spriteSheet" && props.spriteSheet && props.frameWidth && props.frameHeight && props.frameCount) {
      const spriteSheetOptions: SpriteSheetOptions & Partial<AnimationOptions> = {
        type: "spriteSheet",
        spriteSheet: props.spriteSheet,
        frameWidth: props.frameWidth,
        frameHeight: props.frameHeight,
        frameCount: props.frameCount,
        horizontal: props.horizontal,
        rows: props.rows,
        columns: props.columns,
        animationSpeed: props.animationSpeed,
        loop: props.loop,
        moving: props.moving,
        direction: props.direction,
        width: props.width,
        height: props.height,
        onAnimationComplete: props.onAnimationComplete,
        onHitLeft: props.onHitLeft,
        onHitRight: props.onHitRight,
        onGameOver: props.onGameOver,
        initialState: props.initialState,
        hitAnimationOptions: props.hitAnimationOptions,
        deadAnimationOptions: props.deadAnimationOptions,
        victoryAnimationOptions: props.victoryAnimationOptions,
        gameOverAnimationOptions: props.gameOverAnimationOptions,
      };
      return spriteSheetOptions as AnimationOptions;
    } else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
      const imageSequenceOptions: ImageSequenceOptions & Partial<AnimationOptions> = {
        type: "imageSequence",
        imagePaths: props.imagePaths,
        animationSpeed: props.animationSpeed,
        loop: props.loop,
        moving: props.moving,
        direction: props.direction,
        width: props.width,
        height: props.height,
        onAnimationComplete: props.onAnimationComplete,
        onHitLeft: props.onHitLeft,
        onHitRight: props.onHitRight,
        onGameOver: props.onGameOver,
        initialState: props.initialState,
        hitAnimationOptions: props.hitAnimationOptions,
        deadAnimationOptions: props.deadAnimationOptions,
        victoryAnimationOptions: props.victoryAnimationOptions,
        gameOverAnimationOptions: props.gameOverAnimationOptions,
      };
      return imageSequenceOptions as AnimationOptions;
    }

    // 기본값 (타입 오류 방지용)
    if (props.type === "spriteSheet") {
      return {
        type: "spriteSheet",
        spriteSheet: props.spriteSheet || "",
        frameWidth: props.frameWidth || 0,
        frameHeight: props.frameHeight || 0,
        frameCount: props.frameCount || 0,
      } as AnimationOptions;
    } else {
      return {
        type: "imageSequence",
        imagePaths: props.imagePaths || [],
      } as AnimationOptions;
    }
  };

  const animationOptions = createAnimationOptions();

  // 게임 애니메이션 훅 사용
  const { isLoaded, initializeApp, playAnimation, cleanup, appRef, changeAnimationState, currentState, setHP, setTimeRemaining } = useGameAnimation(animationOptions);

  // HP 변경 시 상태 업데이트
  useEffect(() => {
    if (hp !== undefined) {
      setHP(hp);
    }
  }, [hp, setHP]);

  // 남은 시간 변경 시 상태 업데이트
  useEffect(() => {
    if (timeRemaining !== undefined) {
      setTimeRemaining(timeRemaining);
    }
  }, [timeRemaining, setTimeRemaining]);

  // 직접 이미지 로드 확인 (디버깅용)
  useEffect(() => {
    if (props.type === "spriteSheet" && props.spriteSheet) {
      const img = new Image();
      img.onload = () => {
        console.log("이미지 직접 로드 성공:", props.spriteSheet);
      };
      img.onerror = (e) => {
        console.error("이미지 직접 로드 실패:", props.spriteSheet, e);
      };
      img.src = props.spriteSheet;
    } else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
      const img = new Image();
      img.onload = () => {
        console.log("이미지 직접 로드 성공:", props.imagePaths![0]);
      };
      img.onerror = (e) => {
        console.error("이미지 직접 로드 실패:", props.imagePaths![0], e);
      };
      img.src = props.imagePaths[0];
    }
  }, [props.type, props.spriteSheet, props.imagePaths]);

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
        console.log("애니메이션 재생 상태 변경:", isPlaying);
        playAnimation(isPlaying);
      } catch (error) {
        console.error("애니메이션 재생 중 오류:", error);
      }
    }
  }, [isPlaying, playAnimation, isReady]);

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

  // 폴백 이미지 URL 결정
  const getFallbackImageUrl = () => {
    if (props.type === "spriteSheet" && props.spriteSheet) {
      return props.spriteSheet;
    } else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
      return props.imagePaths[0];
    }
    return "";
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 로딩 스피너 */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* 애니메이션 컨테이너 */}
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent" style={{ opacity: 1 }} />

      {/* 폴백 이미지 - 애니메이션이 실패할 경우 표시 */}
      {isReady && getFallbackImageUrl() && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 0.5,
            pointerEvents: "none",
            backgroundImage: `url(${getFallbackImageUrl()})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      )}

      {/* 디버그 정보 (개발 환경에서만 표시) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1">
          상태: {currentState} | HP: {hp} | 시간: {timeRemaining}
        </div>
      )}
    </div>
  );
};

export default GameAnimation;
