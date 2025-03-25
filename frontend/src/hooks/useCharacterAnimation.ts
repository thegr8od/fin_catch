import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import { CharacterState, CharacterSpriteConfig } from "../components/game/types/character";
import { useCharacter, CharacterType } from "../components/game/constants/animations";

interface UseCharacterAnimationProps {
  state: CharacterState;
  characterType?: CharacterType;
  direction?: boolean;
  scale?: number;
  onAnimationComplete?: () => void;
  loop?: boolean;
  size?: "small" | "large";
}

// 전역 텍스처 캐시
const textureCache: Record<string, PIXI.Texture[]> = {};

// 텍스처 프리로딩 함수
const preloadTexture = async (config: CharacterSpriteConfig, characterType: CharacterType, state: CharacterState): Promise<PIXI.Texture[]> => {
  const cacheKey = `${characterType}_${state}`;

  if (textureCache[cacheKey]) {
    console.log("캐시된 텍스처 사용:", cacheKey);
    return textureCache[cacheKey];
  }

  return new Promise((resolve, reject) => {
    try {
      if (!config || !config.spriteSheet) {
        throw new Error(`스프라이트 시트 설정이 없습니다. characterType: ${characterType}, state: ${state}`);
      }

      console.log("스프라이트 시트 로딩 시작:", {
        path: config.spriteSheet,
        characterType,
        state,
        frameCount: config.frameCount,
        frameWidth: config.frameWidth,
        frameHeight: config.frameHeight,
      });

      // 이미지 존재 여부 확인
      const img = new Image();
      const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
      img.src = `${config.spriteSheet}?t=${timestamp}`;

      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        delete textureCache[cacheKey];
        const error = new Error(`이미지 로드 타임아웃: ${config.spriteSheet}`);
        console.error(error);
        reject(error);
      }, 5000); // 5초 타임아웃

      const handleLoad = () => {
        clearTimeout(timeoutId);
        try {
          const baseTexture = PIXI.BaseTexture.from(img);
          baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

          // 이미지 크기 검증
          if (img.width < config.frameWidth || img.height < config.frameHeight) {
            throw new Error(`이미지 크기가 프레임 크기보다 작습니다. 이미지: ${img.width}x${img.height}, 프레임: ${config.frameWidth}x${config.frameHeight}`);
          }

          const textures = Array.from({ length: config.frameCount }, (_, i) => {
            const x = i * config.frameWidth;
            if (x + config.frameWidth > img.width) {
              throw new Error(`프레임 ${i}가 이미지 범위를 벗어났습니다. x: ${x}, width: ${config.frameWidth}, imageWidth: ${img.width}`);
            }
            const y = 0;
            const rect = new PIXI.Rectangle(x, y, config.frameWidth, config.frameHeight);
            console.log(`프레임 ${i} 생성:`, { x, y, width: config.frameWidth, height: config.frameHeight });
            const texture = new PIXI.Texture(baseTexture, rect);
            return texture;
          });

          textureCache[cacheKey] = textures;
          console.log("텍스처 생성 성공:", {
            cacheKey,
            textureCount: textures.length,
            dimensions: `${img.width}x${img.height}`,
            frameSize: `${config.frameWidth}x${config.frameHeight}`,
            totalFrames: config.frameCount,
            path: config.spriteSheet,
          });
          resolve(textures);
        } catch (error) {
          delete textureCache[cacheKey];
          console.error("텍스처 생성 중 오류:", error);
          reject(error);
        }
      };

      const handleError = () => {
        clearTimeout(timeoutId);
        delete textureCache[cacheKey];
        const error = new Error(`스프라이트 시트를 찾을 수 없습니다: ${config.spriteSheet}`);
        console.error(error);
        reject(error);
      };

      img.onload = handleLoad;
      img.onerror = handleError;
    } catch (error) {
      delete textureCache[cacheKey];
      console.error("텍스처 초기화 중 오류:", error);
      reject(error);
    }
  });
};

export const useCharacterAnimation = ({ state, characterType = "classic", direction = true, scale = 3, onAnimationComplete, loop = true, size = "small" }: UseCharacterAnimationProps) => {
  const animations = useCharacter(characterType);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // 크기 설정
  const dimensions = useMemo(() => {
    // 컨테이너 크기에 맞춰서 설정
    const baseSize = size === "small" ? 150 : 200;
    return {
      width: baseSize,
      height: baseSize,
    };
  }, [size]);

  // PIXI 애플리케이션 초기화
  const initializeApp = useCallback(async () => {
    if (!containerRef.current || appRef.current) return null;

    try {
      console.log("PIXI 앱 초기화 시작");

      // PIXI 설정
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

      const app = new PIXI.Application({
        width: dimensions.width,
        height: dimensions.height,
        backgroundAlpha: 0,
        antialias: false,
      });

      // 컨테이너에 앱 추가
      containerRef.current.appendChild(app.view as HTMLCanvasElement);
      appRef.current = app;

      console.log("PIXI 앱 초기화 완료");
      return app;
    } catch (error) {
      console.error("PIXI 앱 초기화 중 오류:", error);
      setIsReady(false);
      return null;
    }
  }, [dimensions]);

  // 애니메이션 생성 함수
  const createAnimation = useCallback(
    (textures: PIXI.Texture[], config: CharacterSpriteConfig) => {
      try {
        const animation = new PIXI.AnimatedSprite(textures);
        animation.animationSpeed = config.animationSpeed;
        animation.anchor.set(0.5);

        // 크기에 맞게 스케일 조정
        const baseScale = (dimensions.width / config.frameWidth) * 0.6; // 60% 크기로 조정
        animation.scale.set(baseScale * (direction ? 1 : -1), baseScale);

        // 위치 조정 (약간 아래로)
        animation.x = dimensions.width / 2;
        animation.y = dimensions.height / 2 + dimensions.height * 0.1; // 10% 아래로

        animation.loop = loop;
        animation.play();
        setIsReady(true);
        return animation;
      } catch (error) {
        console.error("애니메이션 생성 중 오류:", error);
        setIsReady(false);
        return null;
      }
    },
    [dimensions.width, dimensions.height, direction, loop]
  );

  // 애니메이션 업데이트
  const updateAnimation = useCallback(async () => {
    try {
      const app = appRef.current || (await initializeApp());
      if (!app) {
        console.error("PIXI 앱 초기화 실패");
        setIsReady(false);
        return;
      }

      const config = animations[state];
      if (!config) {
        console.error("애니메이션 설정을 찾을 수 없음:", {
          state,
          characterType,
          availableStates: Object.keys(animations),
        });
        setIsReady(false);
        return;
      }

      console.log("애니메이션 업데이트 시작:", {
        state,
        characterType,
        retryCount: retryCountRef.current,
      });

      const textures = await preloadTexture(config, characterType, state);

      if (!mountedRef.current) {
        console.log("텍스처 로딩 중 컴포넌트 언마운트됨");
        setIsReady(false);
        return;
      }

      const newAnimation = createAnimation(textures, config);
      if (!newAnimation) {
        throw new Error("애니메이션 생성 실패");
      }

      if (animationRef.current) {
        app.stage.removeChild(animationRef.current);
        animationRef.current.destroy();
      }

      app.stage.addChild(newAnimation);
      animationRef.current = newAnimation;

      // 애니메이션 완료 이벤트 핸들러 설정
      if (!loop && onAnimationComplete) {
        newAnimation.onComplete = () => {
          if (mountedRef.current) {
            onAnimationComplete();
          }
        };
      }

      retryCountRef.current = 0;
      setIsReady(true);
    } catch (error) {
      console.error("애니메이션 업데이트 중 오류:", error);

      if (mountedRef.current && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(`애니메이션 업데이트 재시도 (${retryCountRef.current}/${MAX_RETRIES})`);
        setTimeout(() => {
          if (mountedRef.current) {
            updateAnimation();
          }
        }, 1000);
      } else {
        setIsReady(false);
      }
    }
  }, [state, characterType, animations, createAnimation, initializeApp, loop, onAnimationComplete]);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    console.log("컴포넌트 마운트");
    mountedRef.current = true;
    initializedRef.current = false;
    retryCountRef.current = 0;

    return () => {
      console.log("컴포넌트 언마운트");
      mountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      setIsReady(false);
    };
  }, []);

  // 초기화 및 상태 변경 시 애니메이션 업데이트
  useEffect(() => {
    if (!containerRef.current) return;

    const setup = async () => {
      try {
        if (!initializedRef.current) {
          console.log("초기 설정 시작");
          await initializeApp();
          initializedRef.current = true;
          console.log("초기 설정 완료");
        }
        await updateAnimation();
      } catch (error) {
        console.error("애니메이션 설정 중 오류:", error);
        if (mountedRef.current) {
          setIsReady(false);
        }
      }
    };

    setup();
  }, [state, direction, scale, characterType, size, updateAnimation, initializeApp]);

  return { containerRef, isReady };
};
