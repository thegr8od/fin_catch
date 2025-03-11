import { CharacterStateConfig } from "../types/character";

export const characterAnimations: CharacterStateConfig = {
  idle: {
    spriteSheet: "/game/classicCat/IdleCatt.png",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 7,
    animationSpeed: 0.1,
    loop: true,
  },
  die: {
    spriteSheet: "/game/classicCat/DieCatt.png",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 14,
    animationSpeed: 0.1,
    loop: false,
  },
  attack: {
    spriteSheet: "/game/classicCat/AttackCatt.png",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 9,
    animationSpeed: 0.1,
    loop: false,
  },
  hurt: {
    spriteSheet: "/game/classicCat/HurtCatt.png",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 7,
    animationSpeed: 0.1,
    loop: false,
  },
  victory: {
    spriteSheet: "/game/classicCat/VictoryCatt.png",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 18,
    animationSpeed: 0.1,
    loop: false,
  },
};
