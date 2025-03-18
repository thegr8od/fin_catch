import React from "react";
import { CharacterAnimationProps } from "./types/character";
import { useCharacterAnimation } from "./hooks/useCharacterAnimation";
import { CharacterType } from "./constants/animations";

interface ExtendedCharacterAnimationProps extends CharacterAnimationProps {
  characterType?: CharacterType;
  isPlaying?: boolean;
  size?: "small" | "large";
}

const CharacterAnimation: React.FC<ExtendedCharacterAnimationProps> = ({
  state,
  isPlaying = true,
  direction = true,
  scale = 2,
  className = "",
  onAnimationComplete,
  characterType = "classic",
  size = "small",
}) => {
  const { containerRef, isReady } = useCharacterAnimation({
    state,
    direction,
    scale,
    onAnimationComplete,
    characterType,
    size,
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CharacterAnimation);
