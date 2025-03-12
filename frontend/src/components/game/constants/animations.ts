import { useMemo } from "react"
import { CharacterStateConfig } from "../types/character"

export type CharacterType = "classicCat" // | 'modernCat' | 'pixelCat' | ...

interface CharacterFrameConfig {
  frameWidth: number
  frameHeight: number
  frameCount: number
  animationSpeed: number
  loop: boolean
}

const CHARACTER_DEFAULTS = {
  classicCat: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
} as const

const createStateConfig = (characterType: CharacterType, frameCount: number, loop: boolean): CharacterFrameConfig => {
  const defaults = CHARACTER_DEFAULTS[characterType]
  return {
    ...defaults,
    frameCount,
    loop,
  }
}

const CHARACTER_STATE_CONFIGS = {
  classicCat: {
    idle: { frames: 7, loop: true },
    die: { frames: 14, loop: false },
    attack: { frames: 9, loop: false },
    hurt: { frames: 7, loop: false },
    victory: { frames: 18, loop: false },
  },
} as const

const getSpritePath = (characterType: CharacterType, state: keyof CharacterStateConfig) => {
  return `/game/${characterType}/${state.charAt(0).toUpperCase() + state.slice(1)}Catt.png`
}

export const createCharacterAnimations = (characterType: CharacterType): CharacterStateConfig => {
  const stateConfigs = CHARACTER_STATE_CONFIGS[characterType]

  return Object.entries(stateConfigs).reduce((config, [state, { frames, loop }]) => {
    const stateKey = state as keyof CharacterStateConfig
    config[stateKey] = {
      spriteSheet: getSpritePath(characterType, stateKey),
      ...createStateConfig(characterType, frames, loop),
    }
    return config
  }, {} as CharacterStateConfig)
}

export const useCharacter = (characterType: CharacterType) => {
  const animations = useMemo(() =>
    createCharacterAnimations(characterType),
  [characterType]
  );

  return animations;
};

