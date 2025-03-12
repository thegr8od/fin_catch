export type CharacterState = "idle" | "die" | "attack" | "hurt" | "victory";

export interface CharacterSpriteConfig {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  animationSpeed: number;
  loop?: boolean;
}

export type CharacterStateConfig = Record<CharacterState, CharacterSpriteConfig>;

export interface CharacterAnimationProps {
  state: CharacterState;
  isPlaying?: boolean;
  direction?: boolean;
  scale?: number;
  className?: string;
  onAnimationComplete?: () => void;
}
