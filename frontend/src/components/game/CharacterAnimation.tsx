import React, { useRef } from "react";
import { CharacterAnimationProps } from "./types/character";
import { useCharacterAnimation } from "./hooks/useCharacterAnimation";

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({ state, isPlaying = true, direction = true, scale = 3, className = "", onAnimationComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { appRef, isLoaded } = useCharacterAnimation({
    state,
    direction,
    scale,
    onAnimationComplete,
  });

  // 컴포넌트가 마운트되면 PIXI 앱을 컨테이너에 추가
  React.useEffect(() => {
    if (containerRef.current && appRef.current && isLoaded) {
      containerRef.current.appendChild(appRef.current.view as HTMLCanvasElement);
    }
  }, [appRef, isLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default CharacterAnimation;
