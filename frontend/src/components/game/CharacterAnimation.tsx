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
  const [isLoaded, setIsLoaded] = React.useState(false)

  useEffect(() => {
    if (!containerRef.current || appRef.current) return

    const app = new PIXI.Application({
      width: frameWidth * scale,
      height: frameHeight * scale,
      backgroundAlpha: 0,
      antialias: false,
    })

    containerRef.current.appendChild(app.view as HTMLCanvasElement)
    appRef.current = app

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    const baseTexture = PIXI.BaseTexture.from(spriteSheet)
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    const textures = []
    for (let i = 0; i < frameCount; i++) {
      const texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight))
      textures.push(texture)
    }

    const animation = new PIXI.AnimatedSprite(textures)
    animation.animationSpeed = animationSpeed
    animation.loop = state === "idle"
    animation.anchor.set(0.5)
    animation.scale.set(scale)
    animation.x = (frameWidth * scale) / 2
    animation.y = (frameHeight * scale) / 2

    if (!direction) {
      animation.scale.x = -scale
    }

    animation.onComplete = () => {
      if (state === "die" && onAnimationComplete) {
        onAnimationComplete()
      }
    }

    app.stage.addChild(animation)
    animationRef.current = animation

    const updateTextures = () => {
      if (!animationRef.current) return

      const newBaseTexture = PIXI.BaseTexture.from(spriteSheet)
      newBaseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

      const newTextures = []
      for (let i = 0; i < frameCount; i++) {
        const texture = new PIXI.Texture(newBaseTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight))
        newTextures.push(texture)
      }

      animationRef.current.textures = newTextures
      animationRef.current.loop = state === "idle"
    }

    if (prevStateRef.current !== state) {
      updateTextures()
      prevStateRef.current = state
    }

    if (isPlaying) {
      animation.play()
    }

    setIsLoaded(true)

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [spriteSheet, frameWidth, frameHeight, frameCount, animationSpeed, direction, state, scale, onAnimationComplete])

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
