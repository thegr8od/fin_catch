import React, { useEffect, useRef, useState } from "react";
import { useGameAnimation, AnimationState, AnimationOptions, SpriteSheetOptions, ImageSequenceOptions } from "../../hooks/useGameAnimation";

/**
 * 게임 애니메이션 컴포넌트 Props 인터페이스
 * 스프라이트 시트와 이미지 시퀀스 두 가지 타입의 애니메이션을 지원
 *
 * @property {boolean} isPlaying - 애니메이션 재생 여부 (true: 재생, false: 정지)
 * @property {number} hp - 캐릭터 HP (0 이하면 사망 애니메이션 재생)
 * @property {number} timeRemaining - 남은 시간 (0 이하면 게임 종료 애니메이션 재생)
 * @property {string} className - 추가 클래스명 (스타일링 목적)
 * @property {string} type - 애니메이션 타입 ("spriteSheet": 스프라이트 시트 사용, "imageSequence": 개별 이미지 시퀀스 사용)
 * @property {string} spriteSheet - 스프라이트 시트 이미지 경로 (type이 "spriteSheet"일 때 필수)
 * @property {number} frameWidth - 각 프레임의 너비 (type이 "spriteSheet"일 때 필수)
 * @property {number} frameHeight - 각 프레임의 높이 (type이 "spriteSheet"일 때 필수)
 * @property {number} frameCount - 총 프레임 수 (type이 "spriteSheet"일 때 필수)
 * @property {string[]} imagePaths - 이미지 경로 배열 (type이 "imageSequence"일 때 필수)
 * @property {number} animationSpeed - 애니메이션 속도 (값이 클수록 빠름, 기본값: 0.2)
 * @property {boolean} loop - 애니메이션 반복 여부 (true: 반복, false: 한 번만 재생)
 * @property {boolean} moving - 이동 애니메이션 여부 (true: 이동, false: 제자리 애니메이션)
 * @property {boolean} direction - 애니메이션 방향 (true: 왼쪽→오른쪽, false: 오른쪽→왼쪽)
 * @property {number} width - 애니메이션 너비 (픽셀 단위)
 * @property {number} height - 애니메이션 높이 (픽셀 단위)
 * @property {boolean} horizontal - 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
 * @property {number} rows - 스프라이트 시트 행 수 (세로 배열일 때 사용)
 * @property {number} columns - 스프라이트 시트 열 수 (가로 배열일 때 사용)
 * @property {function} onAnimationComplete - 애니메이션 완료 시 호출될 콜백 함수
 * @property {function} onHitLeft - 왼쪽 충돌 시 호출될 콜백 함수 (주로 왼쪽 캐릭터 피격 처리)
 * @property {function} onHitRight - 오른쪽 충돌 시 호출될 콜백 함수 (주로 오른쪽 캐릭터 피격 처리)
 * @property {function} onGameOver - 게임 종료 시 호출될 콜백 함수
 * @property {AnimationState} initialState - 초기 애니메이션 상태 (IDLE, MOVING, HIT, DEAD, VICTORY, GAME_OVER 중 하나)
 * @property {SpriteSheetOptions|ImageSequenceOptions} hitAnimationOptions - 피격 애니메이션 옵션 (피격 상태일 때 사용할 애니메이션 정의)
 * @property {SpriteSheetOptions|ImageSequenceOptions} deadAnimationOptions - 사망 애니메이션 옵션 (사망 상태일 때 사용할 애니메이션 정의)
 * @property {SpriteSheetOptions|ImageSequenceOptions} victoryAnimationOptions - 승리 애니메이션 옵션 (승리 상태일 때 사용할 애니메이션 정의)
 * @property {SpriteSheetOptions|ImageSequenceOptions} gameOverAnimationOptions - 게임 종료 애니메이션 옵션 (게임 종료 상태일 때 사용할 애니메이션 정의)
 */
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
  hurtAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
  sleepAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions;
}

/**
 * 게임 애니메이션 컴포넌트
 * 다양한 게임 상태(기본, 피격, 사망, 승리, 게임 종료)에 따른 애니메이션을 처리
 * 스프라이트 시트와 이미지 시퀀스 두 가지 타입의 애니메이션을 지원
 * PixiJS를 사용하여 고성능 애니메이션 렌더링
 *
 * @param {GameAnimationProps} props - 게임 애니메이션 컴포넌트 props
 * @returns {JSX.Element} - 게임 애니메이션 컴포넌트
 */
const GameAnimation: React.FC<GameAnimationProps> = (props) => {
  // props 구조 분해 할당
  const { isPlaying, hp, timeRemaining, className = "", ...restProps } = props;

  // 컨테이너 참조 - PixiJS 애플리케이션이 마운트될 DOM 요소
  const containerRef = useRef<HTMLDivElement>(null);
  // 애니메이션 준비 상태 - 로딩 스피너 표시 여부 결정
  const [isReady, setIsReady] = useState(false);
  // 컴포넌트 마운트 상태 참조 - 언마운트 시 메모리 누수 방지
  const mountedRef = useRef<boolean>(true);

  /**
   * AnimationOptions 객체 생성 함수
   * props에서 애니메이션 옵션 객체를 생성하여 useGameAnimation 훅에 전달
   *
   * 두 가지 타입의 애니메이션 지원:
   * 1. 스프라이트 시트: 하나의 이미지에 여러 프레임이 포함된 형태
   * 2. 이미지 시퀀스: 개별 이미지들의 배열
   *
   * @returns {AnimationOptions} - 애니메이션 옵션 객체
   */
  const createAnimationOptions = (): AnimationOptions => {
    // 스프라이트 시트 타입이고 필수 속성이 모두 있는 경우
    if (props.type === "spriteSheet" && props.spriteSheet && props.frameWidth && props.frameHeight && props.frameCount) {
      // 스프라이트 시트 옵션 객체 생성
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
        hurtAnimationOptions: props.hurtAnimationOptions,
        sleepAnimationOptions: props.sleepAnimationOptions,
      };
      return spriteSheetOptions as AnimationOptions;
    }
    // 이미지 시퀀스 타입이고 필수 속성이 있는 경우
    else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
      // 이미지 시퀀스 옵션 객체 생성
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
        hurtAnimationOptions: props.hurtAnimationOptions,
        sleepAnimationOptions: props.sleepAnimationOptions,
      };
      return imageSequenceOptions as AnimationOptions;
    }

    // 필수 속성이 없는 경우 기본값 반환 (타입 오류 방지용)
    if (props.type === "spriteSheet") {
      // 스프라이트 시트 타입의 기본값
      return {
        type: "spriteSheet",
        spriteSheet: props.spriteSheet || "",
        frameWidth: props.frameWidth || 0,
        frameHeight: props.frameHeight || 0,
        frameCount: props.frameCount || 0,
      } as AnimationOptions;
    } else {
      // 이미지 시퀀스 타입의 기본값
      return {
        type: "imageSequence",
        imagePaths: props.imagePaths || [],
      } as AnimationOptions;
    }
  };

  // 애니메이션 옵션 생성 - 컴포넌트 렌더링 시 한 번만 실행
  const animationOptions = createAnimationOptions();

  // 게임 애니메이션 훅 사용 - PixiJS 애니메이션 로직 처리
  const {
    isLoaded, // 리소스 로드 완료 여부
    initializeApp, // PixiJS 앱 초기화 함수
    playAnimation, // 애니메이션 재생/정지 함수
    cleanup, // 리소스 정리 함수
    appRef, // PixiJS 앱 참조
    changeAnimationState, // 애니메이션 상태 변경 함수
    currentState, // 현재 애니메이션 상태
    setHP, // HP 설정 함수
    setTimeRemaining, // 남은 시간 설정 함수
  } = useGameAnimation(animationOptions);

  /**
   * HP 변경 감지 효과
   * HP가 변경되면 애니메이션 상태 업데이트
   * HP가 0 이하면 사망 애니메이션으로 전환
   */
  useEffect(() => {
    if (hp !== undefined) {
      setHP(hp); // useGameAnimation 훅의 setHP 함수 호출
    }
  }, [hp, setHP]);

  /**
   * 남은 시간 변경 감지 효과
   * 남은 시간이 변경되면 애니메이션 상태 업데이트
   * 시간이 0 이하면 게임 종료 애니메이션으로 전환
   */
  useEffect(() => {
    if (timeRemaining !== undefined) {
      setTimeRemaining(timeRemaining); // useGameAnimation 훅의 setTimeRemaining 함수 호출
    }
  }, [timeRemaining, setTimeRemaining]);

  /**
   * 이미지 직접 로드 확인 효과 (디버깅용)
   * 이미지 로드 상태를 콘솔에 출력하여 문제 진단에 도움
   * 실제 애니메이션에는 useGameAnimation 훅에서 로드한 이미지 사용
   */
  useEffect(() => {
    // 스프라이트 시트 타입인 경우
    if (props.type === "spriteSheet" && props.spriteSheet) {
      const img = new Image();
      img.onload = () => {
        console.log("이미지 직접 로드 성공:", props.spriteSheet);
      };
      img.onerror = (e) => {
        console.error("이미지 직접 로드 실패:", props.spriteSheet, e);
      };
      img.src = props.spriteSheet;
    }
    // 이미지 시퀀스 타입인 경우 (첫 번째 이미지만 테스트)
    else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
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

  /**
   * 앱 초기화 효과
   * 이미지가 로드되면 PixiJS 애플리케이션 초기화
   * 컨테이너에 PixiJS 앱 마운트 및 애니메이션 설정
   */
  useEffect(() => {
    // 이미지 로드 완료, 컨테이너 존재, 컴포넌트 마운트 상태일 때만 실행
    if (isLoaded && containerRef.current && mountedRef.current) {
      try {
        console.log("앱 초기화 시도");
        // PixiJS 앱 초기화 및 컨테이너에 마운트
        const app = initializeApp(containerRef.current);

        // 초기화 성공 여부와 관계없이 일정 시간 후 준비 완료 상태로 변경
        // 이는 초기화가 실패해도 UI가 멈추지 않도록 하기 위함
        setTimeout(() => {
          if (mountedRef.current) {
            setIsReady(true);
            console.log("애니메이션 준비 완료 (강제)");
          }
        }, 1000);
      } catch (error) {
        console.error("애니메이션 초기화 중 오류:", error);
        // 오류가 발생해도 일정 시간 후 준비 완료 상태로 변경
        // 사용자 경험 향상을 위한 안전장치
        setTimeout(() => {
          if (mountedRef.current) {
            setIsReady(true);
            console.log("애니메이션 준비 완료 (오류 후 강제)");
          }
        }, 1000);
      }
    }
  }, [isLoaded, initializeApp]);

  /**
   * 재생 상태 변경 효과
   * isPlaying prop이 변경될 때 애니메이션 재생/정지 제어
   * 컴포넌트가 준비 완료 상태일 때만 실행
   */
  useEffect(() => {
    if (isReady && mountedRef.current) {
      try {
        console.log("애니메이션 재생 상태 변경:", isPlaying);
        // 애니메이션 재생 상태 변경 (true: 재생, false: 정지)
        playAnimation(isPlaying);
      } catch (error) {
        console.error("애니메이션 재생 중 오류:", error);
      }
    }
  }, [isPlaying, playAnimation, isReady]);

  /**
   * 컴포넌트 언마운트 정리 효과
   * 컴포넌트가 언마운트될 때 리소스 정리
   * 메모리 누수 방지 및 성능 최적화
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false; // 마운트 상태 참조 업데이트
      try {
        cleanup(); // PixiJS 앱 및 리소스 정리
      } catch (error) {
        console.error("리소스 정리 중 오류:", error);
      }
    };
  }, [cleanup]);

  /**
   * 로딩 타임아웃 효과
   * 일정 시간 후 강제로 로딩 상태 해제
   * 무한 로딩 상태 방지를 위한 안전장치
   */
  useEffect(() => {
    // 3초 후 강제로 로딩 상태 해제
    const timer = setTimeout(() => {
      if (!isReady && mountedRef.current) {
        setIsReady(true);
        console.log("타임아웃으로 인한 강제 로딩 완료");
      }
    }, 3000); // 3초 타임아웃

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, [isReady]);

  /**
   * 폴백 이미지 URL 결정 함수
   * 애니메이션이 실패할 경우 표시할 이미지 URL 반환
   * 애니메이션 로드 실패 시 사용자에게 시각적 피드백 제공
   *
   * @returns {string} - 폴백 이미지 URL (없으면 빈 문자열)
   */
  const getFallbackImageUrl = () => {
    // 스프라이트 시트 타입인 경우 스프라이트 시트 이미지 반환
    if (props.type === "spriteSheet" && props.spriteSheet) {
      return props.spriteSheet;
    }
    // 이미지 시퀀스 타입인 경우 첫 번째 이미지 반환
    else if (props.type === "imageSequence" && props.imagePaths && props.imagePaths.length > 0) {
      return props.imagePaths[0];
    }
    // 이미지가 없는 경우 빈 문자열 반환
    return "";
  };

  // 컴포넌트 렌더링
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 로딩 스피너 - 애니메이션이 준비되지 않았을 때 표시 */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* 애니메이션 컨테이너 - PixiJS 앱이 마운트될 DOM 요소 */}
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent" style={{ opacity: 1 }} />

      {/* 폴백 이미지 - 애니메이션이 실패할 경우 표시 */}
      {isReady && getFallbackImageUrl() && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: 0.5, // 반투명 표시
            pointerEvents: "none", // 마우스 이벤트 무시
            backgroundImage: `url(${getFallbackImageUrl()})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      )}

      {/* 디버그 정보 (개발 환경에서만 표시) - 현재 상태, HP, 남은 시간 표시 */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1">
          상태: {currentState} | HP: {hp} | 시간: {timeRemaining}
        </div>
      )}
    </div>
  );
};

export default GameAnimation;
