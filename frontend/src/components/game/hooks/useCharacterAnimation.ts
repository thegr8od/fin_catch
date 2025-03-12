import { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import { CharacterState, CharacterSpriteConfig } from "../types/character"
import { useCharacter, CharacterType } from "../constants/animations"

interface UseCharacterAnimationProps {
  state: CharacterState
  characterType?: CharacterType
  direction?: boolean
  scale?: number
  onAnimationComplete?: () => void
}

export const useCharacterAnimation = ({ state, characterType = "classicCat", direction = true, scale = 3, onAnimationComplete }: UseCharacterAnimationProps) => {
  const animations = useCharacter(characterType)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef<boolean>(false)
  const appRef = useRef<PIXI.Application | null>(null)
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null)
  const initialRenderRef = useRef<boolean>(true)

  // 컨테이너 표시/숨김 설정 함수
  const setContainerVisibility = (visible: boolean) => {
    if (containerRef.current) {
      containerRef.current.style.display = visible ? "block" : "none"
    }
  }

  useEffect(() => {
    mountedRef.current = true

    const createAndSetupAnimation = async () => {
      if (!containerRef.current || !mountedRef.current) return

      // 애니메이션 생성 전에 컨테이너 숨김
      setContainerVisibility(false)

      try {
        const config = animations[state]
        const result = await createAnimation(config)

        if (!result || !mountedRef.current || !containerRef.current) {
          if (result?.app) {
            result.app.destroy(true)
          }
          return
        }

        const { app, animation } = result

        // 방향 설정
        if (!direction) {
          animation.scale.x *= -1
        }

        // 크기 설정
        animation.scale.set(scale * (direction ? 1 : -1), scale)

        if (onAnimationComplete) {
          animation.onComplete = onAnimationComplete
        }

        // 새 애니메이션이 준비된 후에 기존 애니메이션 정리
        const oldApp = appRef.current
        const oldAnimation = animationRef.current

        // 새 애니메이션 설정
        appRef.current = app
        animationRef.current = animation
        containerRef.current.appendChild(app.view as HTMLCanvasElement)

        // 이전 애니메이션 정리
        if (oldAnimation) {
          oldAnimation.destroy()
        }
        if (oldApp) {
          oldApp.destroy(true)
        }

        // 모든 설정이 완료된 후 컨테이너 표시
        requestAnimationFrame(() => {
          setContainerVisibility(true)
        })
      } catch (error) {
        console.error("애니메이션 생성 중 오류 발생:", error)
      }
    }

    // 초기 렌더링인 경우 지연 실행
    if (initialRenderRef.current) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          createAndSetupAnimation()
          initialRenderRef.current = false
        }
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // 상태 변경 시에는 즉시 실행
      createAndSetupAnimation()
    }

    return () => {
      if (!initialRenderRef.current) {
        if (animationRef.current) {
          animationRef.current.destroy()
        }
        if (appRef.current) {
          appRef.current.destroy(true)
        }
      }
    }
  }, [state, direction, scale, onAnimationComplete, animations])

  const createAnimation = async (config: CharacterSpriteConfig) => {
    return new Promise<{ app: PIXI.Application; animation: PIXI.AnimatedSprite } | null>((resolve) => {
      try {
        // 텍스처 로딩
        const baseTexture = PIXI.BaseTexture.from(config.spriteSheet)
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

        // 텍스처가 아직 로드되지 않았다면 기다립니다
        if (!baseTexture.valid) {
          baseTexture.once("loaded", () => {
            // 로드 완료 후 나머지 로직 실행
            createAnimationAfterTextureLoad(baseTexture, config, resolve)
          })
          baseTexture.once("error", (err) => {
            console.error("텍스처 로드 실패:", err)
            resolve(null)
          })
          return
        }

        // 텍스처가 이미 유효하다면 바로 애니메이션 생성
        createAnimationAfterTextureLoad(baseTexture, config, resolve)
      } catch (error) {
        console.error("애니메이션 생성 중 오류 발생:", error)
        resolve(null)
      }
    })
  }

  // 텍스처 로드 후 애니메이션 생성 로직을 별도 함수로 분리
  const createAnimationAfterTextureLoad = (
    baseTexture: PIXI.BaseTexture,
    config: CharacterSpriteConfig,
    resolve: (value: { app: PIXI.Application; animation: PIXI.AnimatedSprite } | null) => void
  ) => {
    if (!mountedRef.current) {
      resolve(null)
      return
    }

    const app = new PIXI.Application({
      width: config.frameWidth * scale,
      height: config.frameHeight * scale,
      backgroundAlpha: 0,
      antialias: false,
    })

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    const textures = []
    for (let i = 0; i < config.frameCount; i++) {
      const texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * config.frameWidth, 0, config.frameWidth, config.frameHeight))
      textures.push(texture)
    }

    const animation = new PIXI.AnimatedSprite(textures)
    animation.animationSpeed = config.animationSpeed
    animation.loop = config.loop ?? false
    animation.anchor.set(0.5)
    animation.scale.set(scale)
    animation.x = (config.frameWidth * scale) / 2
    animation.y = (config.frameHeight * scale) / 2

    app.stage.addChild(animation)
    animation.play()

    resolve({ app, animation })
  }

  return { containerRef }
}
