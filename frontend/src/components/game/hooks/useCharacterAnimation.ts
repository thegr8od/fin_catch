import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { CharacterState } from "../types/character";
import { characterAnimations } from "../constants/animations";

interface UseCharacterAnimationProps {
  state: CharacterState;
  direction?: boolean;
  scale?: number;
  onAnimationComplete?: () => void;
}

export const useCharacterAnimation = ({ state, direction = true, scale = 3, onAnimationComplete }: UseCharacterAnimationProps) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef<boolean>(true);
  const prevStateRef = useRef(state);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const createAnimation = async (config: (typeof characterAnimations)[CharacterState]) => {
    try {
      const baseTexture = PIXI.BaseTexture.from(config.spriteSheet);
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

      const textures = [];
      for (let i = 0; i < config.frameCount; i++) {
        const texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * config.frameWidth, 0, config.frameWidth, config.frameHeight));
        textures.push(texture);
      }

      if (!mountedRef.current) return null;

      const animation = new PIXI.AnimatedSprite(textures);
      animation.animationSpeed = config.animationSpeed;
      animation.loop = config.loop ?? false;
      animation.anchor.set(0.5);
      animation.scale.set(scale);
      animation.x = (config.frameWidth * scale) / 2;
      animation.y = (config.frameHeight * scale) / 2;

      if (!direction) {
        animation.scale.x = -scale;
      }

      animation.onComplete = () => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      };

      return animation;
    } catch (error) {
      console.error("텍스처 로드 중 오류 발생:", error);
      return null;
    }
  };

  // 초기 애니메이션 설정
  useEffect(() => {
    if (!mountedRef.current || appRef.current) return;

    const config = characterAnimations[state];
    const app = new PIXI.Application({
      width: config.frameWidth * scale,
      height: config.frameHeight * scale,
      backgroundAlpha: 0,
      antialias: false,
    });

    appRef.current = app;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    createAnimation(config).then((animation) => {
      if (animation && appRef.current) {
        appRef.current.stage.addChild(animation);
        animationRef.current = animation;
        animation.play();
        setIsLoaded(true);
      }
    });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // 상태 변경 시 애니메이션 업데이트
  useEffect(() => {
    if (prevStateRef.current === state || !appRef.current || !isLoaded) return;

    const config = characterAnimations[state];

    createAnimation(config).then((newAnimation) => {
      if (newAnimation && appRef.current) {
        // 이전 애니메이션 제거
        if (animationRef.current) {
          appRef.current.stage.removeChild(animationRef.current);
          animationRef.current.destroy();
        }

        // 새 애니메이션 추가
        appRef.current.stage.addChild(newAnimation);
        animationRef.current = newAnimation;
        newAnimation.play();
        prevStateRef.current = state;
      }
    });
  }, [state, direction, scale, onAnimationComplete]);

  return {
    appRef,
    animationRef,
    isLoaded,
  };
};
