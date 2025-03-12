import React from "react";
import { CharacterAnimationProps } from "./types/character";
import { useCharacterAnimation } from "./hooks/useCharacterAnimation";
import { CharacterType } from "./constants/animations";

interface ExtendedCharacterAnimationProps extends CharacterAnimationProps {
  resourcesLoaded?: boolean;
  characterType?: CharacterType;
  isPlaying?: boolean;
}

const CharacterAnimation: React.FC<ExtendedCharacterAnimationProps> = ({ state, isPlaying = true, direction = true, scale = 3, className = "", onAnimationComplete, resourcesLoaded = false }) => {
  const { containerRef } = useCharacterAnimation({
    state,
    direction,
    scale,
    onAnimationComplete,
  });

  // 리소스가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!resourcesLoaded) {
    return null;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default CharacterAnimation;
