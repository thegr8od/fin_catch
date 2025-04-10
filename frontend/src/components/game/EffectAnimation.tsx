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
  const cleanupScheduledRef = useRef<boolean>(false)

  const cleanupAnimation = () => {
    if (cleanupScheduledRef.current) return
    cleanupScheduledRef.current = true

    // requestAnimationFrame을 사용하여 다음 프레임에서 정리
    requestAnimationFrame(() => {
      if (!mountedRef.current) return

      if (appRef.current) {
        if (containerRef.current && containerRef.current.contains(appRef.current.view)) {
          containerRef.current.removeChild(appRef.current.view)
        }
        appRef.current.destroy(true)
        appRef.current = null
      }
      animationRef.current = null
      cleanupScheduledRef.current = false
    })
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cleanupAnimation()
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

    // 전역 설정으로 NEAREST 스케일 모드 적용
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    // 모든 텍스처가 로드될 때까지 기다림
    const loadTextures = async () => {
      try {
        const texturePromises = imagePaths.map((path) => {
          return new Promise<PIXI.Texture>((resolve, reject) => {
            const texture = PIXI.Texture.from(path)
            if (texture.baseTexture.valid) {
              texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
              resolve(texture)
            } else {
              texture.baseTexture.once("loaded", () => {
                texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
                resolve(texture)
              })
              texture.baseTexture.once("error", (err) => reject(err))
            }
          })
        })

        const textures = await Promise.all(texturePromises)
        if (!mountedRef.current) return

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
          if (!loop) {
            if (onAnimationComplete) {
              onAnimationComplete()
            }
            // 애니메이션 완료 후 정리 예약
            cleanupAnimation()
          } else if (onAnimationComplete) {
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
                hitRightRef.current = true
                onHitRight()
              }
            } else {
              animationRef.current.x -= 5
              if (animationRef.current.x < width * 0.35 && !hitLeftRef.current && onHitLeft) {
                hitLeftRef.current = true
                onHitLeft()
              }
            }
          })
        }

        setIsLoaded(true)

        if (isPlaying) {
          animation.visible = true
          animation.play()
        }
      } catch (error) {
        console.error("텍스처 로드 중 오류 발생:", error)
      }
    }

    loadTextures()

    return () => {
      cleanupAnimation()
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
