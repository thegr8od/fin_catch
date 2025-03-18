import { CharacterType } from "../constants/animations"

export type CharacterState = "idle" | "attack" | "damage" | "dead" | "victory";

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
  loop?: boolean;
}

export interface PlayerStatus {
  id: number;
  name: string;
  characterType: CharacterType;
  health: number;
  state: CharacterState;
  score: number;
}
