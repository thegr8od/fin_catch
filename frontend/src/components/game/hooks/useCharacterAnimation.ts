import { useEffect, useRef, useMemo } from "react";
import * as PIXI from "pixi.js";
import { CharacterState, CharacterSpriteConfig } from "../types/character";
import { useCharacter, CharacterType } from "../constants/animations";

interface UseCharacterAnimationProps {
  state: CharacterState;
  characterType?: CharacterType;
  direction?: boolean;
  scale?: number;
  onAnimationComplete?: () => void;
  loop?: boolean;
}

// 전역 텍스처 캐시
const textureCache: Record<string, PIXI.Texture[]> = {};

export const useCharacterAnimation = ({ state, characterType = "classic", direction = true, scale = 3, onAnimationComplete, loop = false }: UseCharacterAnimationProps) => {
  const animations = useCharacter(characterType);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  const mountedRef = useRef<boolean>(false);
  const nextAnimationRef = useRef<PIXI.AnimatedSprite | null>(null);

  // PIXI 애플리케이션 메모이제이션
  const app = useMemo(() => {
    if (appRef.current) return appRef.current;

    const newApp = new PIXI.Application({
      width: 96,
      height: 32,
      backgroundAlpha: 0,
      antialias: false,
    });

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    appRef.current = newApp;
    return newApp;
  }, []);

  // 텍스처 로드 및 캐싱
  const getOrCreateTextures = async (config: CharacterSpriteConfig): Promise<PIXI.Texture[]> => {
    const cacheKey = `${characterType}_${state}`;

    if (textureCache[cacheKey]) {
      return textureCache[cacheKey];
    }

    return new Promise((resolve, reject) => {
      try {
        const baseTexture = PIXI.BaseTexture.from(config.spriteSheet);
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        if (baseTexture.valid) {
          const textures = Array.from({ length: config.frameCount }, (_, i) => new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * config.frameWidth, 0, config.frameWidth, config.frameHeight)));
          textureCache[cacheKey] = textures;
          resolve(textures);
        } else {
          baseTexture.once("loaded", () => {
            const textures = Array.from({ length: config.frameCount }, (_, i) => new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * config.frameWidth, 0, config.frameWidth, config.frameHeight)));
            textureCache[cacheKey] = textures;
            resolve(textures);
          });

          baseTexture.once("error", (error) => {
            console.error("텍스처 로딩 실패:", config.spriteSheet, error);
            reject(error);
          });
        }
      } catch (error) {
        console.error("텍스처 생성 중 오류:", error);
        reject(error);
      }
    });
  };

  // 애니메이션 생성 함수
  const createAnimation = (textures: PIXI.Texture[], config: CharacterSpriteConfig) => {
    const animation = new PIXI.AnimatedSprite(textures);
    animation.animationSpeed = config.animationSpeed;
    animation.anchor.set(0.5);
    animation.scale.set(scale * (direction ? 1 : -1), scale);
    animation.x = 48;
    animation.y = 16;
    animation.alpha = 1;
    animation.loop = true;

    animation.play();
    return animation;
  };

  // 애니메이션 업데이트
  const updateAnimation = async () => {
    if (!containerRef.current || !mountedRef.current) return;

    const config = animations[state];
    if (!config) {
      console.error("애니메이션 설정을 찾을 수 없음:", state);
      return;
    }

    try {
      const textures = await getOrCreateTextures(config);
      const newAnimation = createAnimation(textures, config);

      if (animationRef.current) {
        const oldAnimation = animationRef.current;
        oldAnimation.alpha = 1;
        newAnimation.alpha = 0;

        app.stage.addChild(newAnimation);

        let elapsed = 0;
        const duration = 100;
        const tick = () => {
          elapsed += 16.67;
          const progress = Math.min(elapsed / duration, 1);

          if (oldAnimation && oldAnimation.parent) {
            oldAnimation.alpha = 1 - progress;
          }
          newAnimation.alpha = progress;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            if (oldAnimation && oldAnimation.parent) {
              app.stage.removeChild(oldAnimation);
              oldAnimation.destroy();
            }
          }
        };
        requestAnimationFrame(tick);
      } else {
        app.stage.addChild(newAnimation);
      }

      animationRef.current = newAnimation;

      if (!containerRef.current.contains(app.view)) {
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
      }
    } catch (error) {
      console.error("애니메이션 업데이트 중 오류:", error);
    }
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.destroy();
      }
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  // 상태 변경 시 애니메이션 업데이트
  useEffect(() => {
    updateAnimation();
  }, [state, direction, scale, characterType]);

  return { containerRef };
};
