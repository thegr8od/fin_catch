import { useMemo } from "react";
import { CharacterStateConfig } from "../types/character";

export type CharacterType = "classic" | "batman" | "christmas" | "demonic" | "egypt" | "simase" | "tiger" | "yankee" | "nigger" | "unique_rabbit";

interface CharacterFrameConfig {
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  animationSpeed: number;
}

const CHARACTER_DEFAULTS = {
  classic: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  batman: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  christmas: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  demonic: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  egypt: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  simase: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  tiger: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  yankee: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  nigger: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  },
  unique_rabbit: {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 0.1,
  }
} as const;

const CHARACTER_STATE_CONFIGS = {
  classic: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  batman: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  christmas: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  demonic: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  egypt: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  simase: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  tiger: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  nigger: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  yankee: {
    idle: { frames: 7 },
    dead: { frames: 14 },
    attack: { frames: 9 },
    damage: { frames: 7 },
    victory: { frames: 13 },
  },
  unique_rabbit: {
    idle: { frames: 12 },
    dead: { frames: 12 },
    attack: { frames: 9 },
    damage: { frames: 8 },
    victory: { frames: 11 },
  },
} as const;

const getSpritePath = (characterType: CharacterType, state: keyof CharacterStateConfig) => {
  const getStateName = (state: keyof CharacterStateConfig) => {
    switch (state) {
      case "idle":
        return "idle";
      case "attack":
        return "attack";
      case "damage":
        return "damage";
      case "dead":
        return "dead";
      case "victory":
        return "victory";
      default:
        return state;
    }
  };

  const stateName = getStateName(state);
  const path = `/cats_assets/${characterType}/${characterType}_cat_${stateName}.png`;
  console.log("스프라이트 시트 경로:", path);
  return path;
};

const createStateConfig = (characterType: CharacterType, frameCount: number): CharacterFrameConfig => {
  const defaults = CHARACTER_DEFAULTS[characterType] as {
    frameWidth: number;
    frameHeight: number;
    animationSpeed: number;
  };
  return {
    ...defaults,
    frameCount,
  };
};

export const createCharacterAnimations = (characterType: CharacterType): CharacterStateConfig => {
  const stateConfigs = CHARACTER_STATE_CONFIGS[characterType] as {
    [key: string]: { frames: number };
  };

  return Object.entries(stateConfigs).reduce((config, [state, { frames }]) => {
    const stateKey = state as keyof CharacterStateConfig;
    config[stateKey] = {
      spriteSheet: getSpritePath(characterType, stateKey),
      ...createStateConfig(characterType, frames),
    };
    return config;
  }, {} as CharacterStateConfig);
};

export const useCharacter = (characterType: CharacterType) => {
  const animations = useMemo(() => createCharacterAnimations(characterType), [characterType]);
  return animations;
};
