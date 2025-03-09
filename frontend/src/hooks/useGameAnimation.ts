import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";

// 이미지 캐시 객체
const imageCache: Record<string, HTMLImageElement> = {};

// 애니메이션 상태 타입
export enum AnimationState {
  IDLE = "idle",
  MOVING = "moving",
  HIT = "hit",
  DEAD = "dead",
  VICTORY = "victory",
  GAME_OVER = "gameOver",
}

// 이미지 사전 로딩 함수 (단일 이미지)
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // 이미 캐시에 있으면 바로 반환
    if (imageCache[src]) {
      resolve(imageCache[src]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // CORS 문제 해결
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = (e) => {
      console.error(`이미지 로드 실패: ${src}`, e);
      reject(e);
    };
    img.src = src;
  });
};

// 이미지 사전 로딩 함수 (여러 이미지)
const preloadImages = (sources: string[]): Promise<HTMLImageElement[]> => {
  const promises = sources.map((src) => preloadImage(src));
  return Promise.all(promises);
};

// 스프라이트 시트 애니메이션 옵션 인터페이스
export interface SpriteSheetOptions {
  type: "spriteSheet";
  spriteSheet: string; // 스프라이트 시트 이미지 경로
  frameWidth: number; // 각 프레임의 너비
  frameHeight: number; // 각 프레임의 높이
  frameCount: number; // 총 프레임 수
  horizontal?: boolean; // 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
  rows?: number; // 스프라이트 시트의 행 수 (세로 배열일 때 사용)
  columns?: number; // 스프라이트 시트의 열 수 (가로 배열일 때 사용)
}

// 개별 이미지 애니메이션 옵션 인터페이스
export interface ImageSequenceOptions {
  type: "imageSequence";
  imagePaths: string[]; // 이미지 경로 배열
}

// 공통 애니메이션 옵션 인터페이스
export interface CommonAnimationOptions {
  animationSpeed?: number; // 애니메이션 속도 (기본값: 0.2)
  loop?: boolean; // 애니메이션 반복 여부
  moving?: boolean; // 이동 애니메이션 여부 (false일 경우 제자리 애니메이션)
  direction?: boolean; // 애니메이션 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  width?: number; // 컨테이너 너비
  height?: number; // 컨테이너 높이
  onAnimationComplete?: () => void;
  onHitLeft?: () => void; // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  onGameOver?: () => void; // 게임 종료 시 호출될 함수
  initialState?: AnimationState; // 초기 애니메이션 상태
  hitAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions; // 피격 애니메이션 옵션
  deadAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions; // 사망 애니메이션 옵션
  victoryAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions; // 승리 애니메이션 옵션
  gameOverAnimationOptions?: SpriteSheetOptions | ImageSequenceOptions; // 게임 종료 애니메이션 옵션
}

// 애니메이션 옵션 타입
export type AnimationOptions = (SpriteSheetOptions | ImageSequenceOptions) & CommonAnimationOptions;

// 애니메이션 훅 반환 타입
export interface UseGameAnimationReturn {
  isLoaded: boolean;
  initializeApp: (container: HTMLDivElement) => PIXI.Application | null;
  playAnimation: (play: boolean) => void;
  cleanup: () => void;
  appRef: React.MutableRefObject<PIXI.Application | null>;
  changeAnimationState: (state: AnimationState) => void;
  currentState: AnimationState;
  setHP: (hp: number) => void;
  setTimeRemaining: (seconds: number) => void;
}

export function useGameAnimation(options: AnimationOptions): UseGameAnimationReturn {
  // 옵션 분해
  const {
    animationSpeed = 0.2,
    loop = false,
    moving = false,
    direction = true,
    width = 800,
    height = 600,
    onAnimationComplete,
    onHitLeft,
    onHitRight,
    onGameOver,
    initialState = AnimationState.IDLE,
    hitAnimationOptions,
    deadAnimationOptions,
    victoryAnimationOptions,
    gameOverAnimationOptions,
  } = options;

  // PixiJS 앱 참조
  const appRef = useRef<PIXI.Application | null>(null);
  // 애니메이션 참조
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  // 초기화 여부 참조
  const initializedRef = useRef<boolean>(false);
  // 재생 상태 참조
  const isPlayingRef = useRef<boolean>(false);
  // 충돌 감지 참조
  const hitRightRef = useRef<boolean>(false);
  const hitLeftRef = useRef<boolean>(false);
  // 컨테이너 크기 참조
  const containerWidthRef = useRef<number>(width);
  const containerHeightRef = useRef<number>(height);
  // 로딩 상태
  const [isLoaded, setIsLoaded] = useState(false);
  // 텍스처 배열
  const [textures, setTextures] = useState<PIXI.Texture[]>([]);
  // 현재 애니메이션 상태
  const [currentState, setCurrentState] = useState<AnimationState>(initialState);
  // HP 상태
  const [hp, setHP] = useState<number>(100);
  // 남은 시간
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  // 애니메이션 상태별 텍스처 맵
  const texturesMapRef = useRef<Record<AnimationState, PIXI.Texture[]>>({} as Record<AnimationState, PIXI.Texture[]>);
  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 이미지 사전 로딩
  useEffect(() => {
    const loadResources = async () => {
      try {
        // 기본 애니메이션 리소스 로드
        if (options.type === "spriteSheet") {
          await preloadImage(options.spriteSheet);
        } else {
          await preloadImages(options.imagePaths);
        }

        // 추가 애니메이션 리소스 로드 (피격, 사망, 승리, 게임 종료)
        const additionalResources = [hitAnimationOptions, deadAnimationOptions, victoryAnimationOptions, gameOverAnimationOptions].filter(Boolean);

        for (const resource of additionalResources) {
          if (resource?.type === "spriteSheet") {
            await preloadImage(resource.spriteSheet);
          } else if (resource?.type === "imageSequence") {
            await preloadImages(resource.imagePaths);
          }
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("리소스 로딩 실패:", error);
      }
    };

    loadResources();
  }, [options, hitAnimationOptions, deadAnimationOptions, victoryAnimationOptions, gameOverAnimationOptions]);

  // 텍스처 생성 함수
  const createTextures = useCallback((animOptions: SpriteSheetOptions | ImageSequenceOptions): PIXI.Texture[] => {
    if (animOptions.type === "spriteSheet") {
      const { spriteSheet, frameWidth, frameHeight, frameCount, horizontal = true, rows = 1, columns = 0 } = animOptions;

      try {
        // 캐시된 이미지를 사용하여 베이스 텍스처 생성
        const baseTexture = PIXI.BaseTexture.from(spriteSheet);

        // 텍스처 캐싱 활성화
        baseTexture.cacheId = spriteSheet;
        PIXI.utils.TextureCache[spriteSheet] = new PIXI.Texture(baseTexture);

        // 기본 텍스처 설정
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // 픽셀 아트에 적합한 설정

        const newTextures: PIXI.Texture[] = [];

        // 열 수 계산 (가로 배열일 때)
        const calculatedColumns = columns > 0 ? columns : Math.ceil(frameCount / rows);

        // 스프라이트 시트에서 각 프레임의 텍스처 추출
        for (let i = 0; i < frameCount; i++) {
          let x, y;

          if (horizontal) {
            // 가로 배열 (행 우선)
            x = (i % calculatedColumns) * frameWidth;
            y = Math.floor(i / calculatedColumns) * frameHeight;
          } else {
            // 세로 배열 (열 우선)
            x = Math.floor(i / rows) * frameWidth;
            y = (i % rows) * frameHeight;
          }

          // 프레임 경계에 약간의 여백 추가 (1px)
          const padding = 1;
          const rect = new PIXI.Rectangle(x + padding, y + padding, frameWidth - padding * 2, frameHeight - padding * 2);

          const texture = new PIXI.Texture(baseTexture, rect);

          // 텍스처 스케일링 모드 설정 (픽셀 아트에 적합한 설정)
          texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

          newTextures.push(texture);
        }

        return newTextures;
      } catch (error) {
        console.error("스프라이트 시트 텍스처 생성 실패:", error);
        return [];
      }
    } else {
      // 이미지 시퀀스 텍스처 생성
      const { imagePaths } = animOptions;
      try {
        return imagePaths.map((src) => {
          // 텍스처 캐싱 활성화
          if (PIXI.utils.TextureCache[src]) {
            return PIXI.utils.TextureCache[src];
          }

          const texture = PIXI.Texture.from(src);
          // 텍스처 캐싱
          texture.baseTexture.cacheId = src;
          PIXI.utils.TextureCache[src] = texture;

          return texture;
        });
      } catch (error) {
        console.error("이미지 시퀀스 텍스처 생성 실패:", error);
        return [];
      }
    }
  }, []);

  // 모든 상태의 텍스처 생성
  useEffect(() => {
    if (!isLoaded) return;

    try {
      // 기본 텍스처 생성
      const mainTextures = createTextures(options);
      setTextures(mainTextures);
      texturesMapRef.current[AnimationState.IDLE] = mainTextures;
      texturesMapRef.current[AnimationState.MOVING] = mainTextures;

      // 추가 애니메이션 텍스처 생성
      if (hitAnimationOptions) {
        texturesMapRef.current[AnimationState.HIT] = createTextures(hitAnimationOptions);
      } else {
        texturesMapRef.current[AnimationState.HIT] = mainTextures;
      }

      if (deadAnimationOptions) {
        texturesMapRef.current[AnimationState.DEAD] = createTextures(deadAnimationOptions);
      } else {
        texturesMapRef.current[AnimationState.DEAD] = mainTextures;
      }

      if (victoryAnimationOptions) {
        texturesMapRef.current[AnimationState.VICTORY] = createTextures(victoryAnimationOptions);
      } else {
        texturesMapRef.current[AnimationState.VICTORY] = mainTextures;
      }

      if (gameOverAnimationOptions) {
        texturesMapRef.current[AnimationState.GAME_OVER] = createTextures(gameOverAnimationOptions);
      } else {
        texturesMapRef.current[AnimationState.GAME_OVER] = mainTextures;
      }
    } catch (error) {
      console.error("텍스처 생성 실패:", error);
    }
  }, [isLoaded, options, createTextures, hitAnimationOptions, deadAnimationOptions, victoryAnimationOptions, gameOverAnimationOptions]);

  // PixiJS 앱 초기화 및 애니메이션 생성 함수
  const initializeApp = useCallback(
    (container: HTMLDivElement) => {
      if (!isLoaded || textures.length === 0 || initializedRef.current) return null;

      // 컨테이너 참조 저장
      containerRef.current = container;

      // 초기화 상태 업데이트
      initializedRef.current = true;

      // 기존 캔버스 제거 (중복 방지)
      const existingCanvas = container.querySelector("canvas");
      if (existingCanvas) {
        try {
          container.removeChild(existingCanvas);
        } catch (error) {
          console.error("기존 캔버스 제거 중 오류:", error);
        }
      }

      // 컨테이너 크기 가져오기
      containerWidthRef.current = container.clientWidth || width;
      containerHeightRef.current = container.clientHeight || height;

      console.log("컨테이너 크기:", containerWidthRef.current, containerHeightRef.current);

      // 캔버스 생성 - 처음에는 숨김 상태로 시작하지 않음
      const canvas = document.createElement("canvas");
      canvas.width = containerWidthRef.current;
      canvas.height = containerHeightRef.current;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none"; // 마우스 이벤트 무시
      canvas.style.zIndex = "100"; // z-index 값을 높여서 다른 요소 위에 표시
      canvas.style.backgroundColor = "transparent"; // 배경 투명
      canvas.style.visibility = "visible"; // 처음부터 보이게 설정

      // 컨테이너에 캔버스 추가
      container.appendChild(canvas);

      // PixiJS 앱 생성 - WebGL 렌더러 설정 최적화
      const app = new PIXI.Application({
        width: containerWidthRef.current,
        height: containerHeightRef.current,
        backgroundAlpha: 0,
        view: canvas,
        forceCanvas: false,
        antialias: false, // 안티앨리어싱 비활성화 (픽셀 아트에 적합)
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        clearBeforeRender: true,
        powerPreference: "high-performance", // 고성능 GPU 사용 요청
      });

      // 렌더러에 투명도 설정 추가
      if (app.renderer) {
        // 타입 안전하게 처리하기 위해 unknown으로 캐스팅 후 접근
        const renderer = app.renderer as unknown;
        // 속성 접근 및 설정
        if (renderer) {
          // 객체로 타입 단언 후 속성 설정
          const rendererObj = renderer as Record<string, unknown>;
          // 타입 안전하게 속성 설정
          if (typeof rendererObj.backgroundColor !== "undefined") {
            (rendererObj as Record<string, number>).backgroundColor = 0x000000;
          }
          if (typeof rendererObj.backgroundAlpha !== "undefined") {
            (rendererObj as Record<string, number>).backgroundAlpha = 0;
          }
        }
      }

      appRef.current = app;

      // 캔버스 컨텍스트에 투명도 설정 (필요한 경우)
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalAlpha = 1; // 완전 불투명으로 설정
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // 애니메이션 스프라이트 생성
      const animation = new PIXI.AnimatedSprite(textures);

      // 애니메이션 설정
      animation.animationSpeed = animationSpeed; // 애니메이션 속도
      animation.loop = loop; // 반복 여부

      // 픽셀 아트에 적합한 설정 (더 선명한 이미지)
      animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

      // 애니메이션 위치 설정
      if (moving) {
        // 이동 애니메이션인 경우
        if (direction) {
          // 왼쪽에서 오른쪽으로
          animation.x = containerWidthRef.current / 4; // 시작 위치를 화면 안쪽으로 조정
          animation.y = containerHeightRef.current / 2; // 중앙 높이
        } else {
          // 오른쪽에서 왼쪽으로
          animation.x = (containerWidthRef.current * 3) / 4; // 시작 위치를 화면 안쪽으로 조정
          animation.y = containerHeightRef.current / 2; // 중앙 높이
          animation.scale.x = -1; // 수평 반전
        }
      } else {
        // 제자리 애니메이션인 경우
        animation.x = containerWidthRef.current / 2; // 중앙 위치
        animation.y = containerHeightRef.current / 2; // 중앙 높이
      }

      // 앵커 포인트 설정 (중앙)
      animation.anchor.set(0.5);

      // 크기 설정 (더 크게 조정)
      animation.width = 200;
      animation.height = 200;

      // 애니메이션 완료 이벤트
      animation.onComplete = () => {
        console.log("애니메이션 완료");

        // 상태에 따른 처리
        if (currentState === AnimationState.HIT) {
          // 피격 애니메이션 완료 후 IDLE 상태로 복귀
          setCurrentState(AnimationState.IDLE);
        } else if (currentState === AnimationState.DEAD || currentState === AnimationState.GAME_OVER) {
          // 사망 또는 게임 종료 애니메이션 완료 후 게임 종료 처리
          if (onGameOver) {
            setTimeout(() => onGameOver(), 0);
          }
        } else {
          // 충돌 감지 로직
          if (direction && onHitRight) {
            setTimeout(() => onHitRight(), 0);
          } else if (!direction && onHitLeft) {
            setTimeout(() => onHitLeft(), 0);
          }

          // 애니메이션 완료 콜백
          if (onAnimationComplete) {
            setTimeout(() => onAnimationComplete(), 0);
          }
        }
      };

      // 앱에 애니메이션 추가
      app.stage.addChild(animation);

      // 애니메이션 참조 저장
      animationRef.current = animation;

      // 애니메이션 업데이트 함수
      const updateAnimation = () => {
        if (!animationRef.current || !appRef.current) return;

        const animation = animationRef.current;

        if (moving) {
          // 이동 애니메이션인 경우
          if (direction) {
            // 왼쪽에서 오른쪽으로
            animation.x += 2; // 이동 속도 조정

            // 오른쪽 경계에 도달했는지 확인
            if (animation.x > containerWidthRef.current + animation.width / 2) {
              // 애니메이션 중지 및 숨기기
              animation.visible = false;
              animation.stop();

              // 충돌 감지 로직
              if (!hitRightRef.current && onHitRight) {
                hitRightRef.current = true;
                setTimeout(() => onHitRight(), 0);
              }

              // 애니메이션 완료 콜백
              if (onAnimationComplete) {
                setTimeout(() => onAnimationComplete(), 0);
              }
            }
          } else {
            // 오른쪽에서 왼쪽으로
            animation.x -= 2; // 이동 속도 조정

            // 왼쪽 경계에 도달했는지 확인
            if (animation.x < -animation.width / 2) {
              // 애니메이션 중지 및 숨기기
              animation.visible = false;
              animation.stop();

              // 충돌 감지 로직
              if (!hitLeftRef.current && onHitLeft) {
                hitLeftRef.current = true;
                setTimeout(() => onHitLeft(), 0);
              }

              // 애니메이션 완료 콜백
              if (onAnimationComplete) {
                setTimeout(() => onAnimationComplete(), 0);
              }
            }
          }
        }
      };

      // 애니메이션 업데이트 티커 추가
      app.ticker.add(updateAnimation);

      return app;
    },
    [isLoaded, textures, animationSpeed, loop, moving, direction, width, height, onAnimationComplete, onHitLeft, onHitRight, onGameOver, currentState]
  );

  // 애니메이션 상태 변경 함수
  const changeAnimationState = useCallback(
    (state: AnimationState) => {
      if (state === currentState) return;

      setCurrentState(state);

      // 애니메이션 텍스처 변경
      if (animationRef.current && texturesMapRef.current[state]) {
        // 현재 애니메이션 중지
        animationRef.current.stop();

        // 텍스처 변경
        animationRef.current.textures = texturesMapRef.current[state];

        // 애니메이션 설정 변경
        switch (state) {
          case AnimationState.HIT:
            animationRef.current.loop = false;
            break;
          case AnimationState.DEAD:
            animationRef.current.loop = false;
            break;
          case AnimationState.VICTORY:
            animationRef.current.loop = true;
            break;
          case AnimationState.GAME_OVER:
            animationRef.current.loop = false;
            break;
          default:
            animationRef.current.loop = loop;
            break;
        }

        // 애니메이션 재생
        if (isPlayingRef.current) {
          animationRef.current.play();
        }
      }
    },
    [currentState, loop]
  );

  // HP 변경 감시
  useEffect(() => {
    if (hp <= 0) {
      changeAnimationState(AnimationState.DEAD);
    }
  }, [hp, changeAnimationState]);

  // 시간 변경 감시
  useEffect(() => {
    if (timeRemaining <= 0) {
      changeAnimationState(AnimationState.GAME_OVER);
    }
  }, [timeRemaining, changeAnimationState]);

  // 애니메이션 재생 함수
  const playAnimation = useCallback((play: boolean) => {
    if (!animationRef.current) return;

    isPlayingRef.current = play;

    if (play) {
      // 애니메이션 재생
      animationRef.current.visible = true;
      animationRef.current.play();
    } else {
      // 애니메이션 중지
      animationRef.current.stop();
    }
  }, []);

  // 리소스 정리 함수
  const cleanup = useCallback(() => {
    // 애니메이션 참조 정리
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current.destroy();
      animationRef.current = null;
    }

    // PixiJS 앱 정리
    if (appRef.current) {
      appRef.current.ticker.stop();
      appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      appRef.current = null;
    }

    // 캔버스 제거
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        try {
          containerRef.current.removeChild(canvas);
        } catch (error) {
          console.error("캔버스 제거 중 오류:", error);
        }
      }
    }

    // 초기화 상태 리셋
    initializedRef.current = false;
    // 충돌 감지 상태 리셋
    hitRightRef.current = false;
    hitLeftRef.current = false;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isLoaded,
    initializeApp,
    playAnimation,
    cleanup,
    appRef,
    changeAnimationState,
    currentState,
    setHP,
    setTimeRemaining,
  };
}
