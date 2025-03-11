import React, { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"

interface CharacterAnimationProps {
  spriteSheet: string
  frameWidth: number
  frameHeight: number
  frameCount: number
  animationSpeed: number
  state: "idle" | "die"
  isPlaying?: boolean
  direction?: boolean
  scale?: number
  className?: string
  onAnimationComplete?: () => void
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  animationSpeed,
  state,
  isPlaying = true,
  direction = true,
  scale = 3,
  className = "",
  onAnimationComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null)
  const prevStateRef = useRef(state)

  useEffect(() => {
    if (!containerRef.current || appRef.current) return

    // 전역 설정: 모든 텍스처에 NEAREST 스케일링 모드 적용
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    const app = new PIXI.Application({
      width: frameWidth * scale,
      height: frameHeight * scale,
      backgroundAlpha: 0,
      antialias: false,
    })

    containerRef.current.appendChild(app.view as HTMLCanvasElement)
    appRef.current = app

    const baseTexture = PIXI.BaseTexture.from(spriteSheet)
    // 개별 텍스처에도 NEAREST 스케일링 모드 적용
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    const textures = []

    for (let i = 0; i < frameCount; i++) {
      const frame = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight)
      const texture = new PIXI.Texture(baseTexture, frame)
      textures.push(texture)
    }

    const animation = new PIXI.AnimatedSprite(textures)
    animation.animationSpeed = animationSpeed
    animation.loop = state === "idle"
    animation.anchor.set(0.5)
    animation.x = (frameWidth * scale) / 2
    animation.y = (frameHeight * scale) / 2
    animation.width = frameWidth * scale
    animation.height = frameHeight * scale

    if (!direction) {
      animation.scale.x *= -1
    }

    if (onAnimationComplete) {
      animation.onComplete = onAnimationComplete
    }

    app.stage.addChild(animation)
    animationRef.current = animation

    if (isPlaying) {
      animation.play()
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [spriteSheet, frameWidth, frameHeight, frameCount, animationSpeed, direction, state, scale, onAnimationComplete])

  useEffect(() => {
    if (!animationRef.current) return

    // 상태가 변경되었을 때만 처리
    if (prevStateRef.current !== state) {
      animationRef.current.loop = state === "idle"

      if (state === "die") {
        // 죽는 모션일 때는 처음부터 재생
        animationRef.current.gotoAndPlay(0)
      } else if (state === "idle") {
        // idle 상태일 때는 계속 재생
        animationRef.current.play()
      }

      prevStateRef.current = state
    }
  }, [state])

  useEffect(() => {
    if (!animationRef.current) return

    if (isPlaying) {
      if (!animationRef.current.playing) {
        animationRef.current.play()
      }
    } else {
      animationRef.current.stop()
    }
  }, [isPlaying])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

export default CharacterAnimation
