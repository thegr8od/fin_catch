import React, { useEffect, useRef, useState } from "react"
import * as PIXI from "pixi.js"

interface EffectAnimationProps {
  isPlaying: boolean
  imagePaths: string[]
  width: number
  height: number
  animationSpeed: number
  moving?: boolean
  direction?: boolean
  loop?: boolean
  onAnimationComplete?: () => void
  onHitLeft?: () => void
  onHitRight?: () => void
  className?: string
}

const EffectAnimation: React.FC<EffectAnimationProps> = ({
  isPlaying,
  imagePaths,
  width,
  height,
  animationSpeed,
  moving = false,
  direction = true,
  loop = false,
  onAnimationComplete,
  onHitLeft,
  onHitRight,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const mountedRef = useRef<boolean>(true)
  const hitLeftRef = useRef<boolean>(false)
  const hitRightRef = useRef<boolean>(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || appRef.current) return

    const app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      antialias: false,
    })

    containerRef.current.appendChild(app.view as HTMLCanvasElement)
    appRef.current = app

    const textures = imagePaths.map((path) => PIXI.Texture.from(path))
    const animation = new PIXI.AnimatedSprite(textures)

    animation.animationSpeed = animationSpeed
    animation.loop = loop
    animation.anchor.set(0.5)

    if (moving) {
      if (direction) {
        animation.x = width / 4
      } else {
        animation.x = (width * 3) / 4
        animation.scale.x = -1
      }
    } else {
      animation.x = width / 2
    }

    animation.y = height / 2
    animation.width = width
    animation.height = height

    animation.onComplete = () => {
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }

    app.stage.addChild(animation)
    animationRef.current = animation

    if (moving) {
      app.ticker.add(() => {
        if (!animationRef.current) return

        if (direction) {
          animationRef.current.x += 5
          if (animationRef.current.x > width * 0.65 && !hitRightRef.current && onHitRight) {
            console.log("오른쪽 플레이어 충돌 감지!", animationRef.current.x, width * 0.65)
            hitRightRef.current = true
            onHitRight()
          }
        } else {
          animationRef.current.x -= 5
          if (animationRef.current.x < width * 0.35 && !hitLeftRef.current && onHitLeft) {
            console.log("왼쪽 플레이어 충돌 감지!", animationRef.current.x, width * 0.35)
            hitLeftRef.current = true
            onHitLeft()
          }
        }
      })
    }

    setIsLoaded(true)

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [imagePaths, width, height, animationSpeed, moving, direction, loop, onAnimationComplete, onHitLeft, onHitRight])

  useEffect(() => {
    if (!animationRef.current) return

    if (isPlaying) {
      hitLeftRef.current = false
      hitRightRef.current = false
      animationRef.current.visible = true
      animationRef.current.play()
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

export default EffectAnimation
