// hooks/useGameResources.ts
import { useState, useEffect, useRef } from "react"
import { useLoading } from "../contexts/LoadingContext"

export const useGameResources = (characterTypes: string[]) => {
  const { setLoading, setProgress, completeLoading } = useLoading()
  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const isMountedRef = useRef<boolean>(false)
  const prevCharacterTypesRef = useRef<string[]>(characterTypes)

  useEffect(() => {
    // 이전 characterTypes와 현재 characterTypes를 비교
    const hasSameLength = prevCharacterTypesRef.current.length === characterTypes.length
    const hasSameValues = hasSameLength && 
      characterTypes.every((type, index) => type === prevCharacterTypesRef.current[index])

    // 값이 같으면 리소스 로딩을 건너뜀
    if (hasSameValues && resourcesLoaded) {
      return
    }

    // 값이 다르면 현재 값을 저장하고 리소스 로딩 시작
    prevCharacterTypesRef.current = [...characterTypes]
    
    // 초기 로딩 상태 설정
    setLoading(true)
    setProgress(0)
    isMountedRef.current = true

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src

        const timeoutId = setTimeout(() => {
          reject(new Error(`이미지 로드 타임아웃: ${src}`))
        }, 5000)

        img.onload = () => {
          clearTimeout(timeoutId)
          resolve(img)
        }

        img.onerror = () => {
          clearTimeout(timeoutId)
          reject(new Error(`이미지 로드 실패: ${src}`))
        }
      })
    }

    const loadResources = async () => {
      try {
        setProgress(10)

        const stateFiles = ["idle", "attack", "damage", "dead", "victory"]
        const imagesToLoad = characterTypes.flatMap((charType) => stateFiles.map((state) => `/cats_assets/${charType}/${charType}_cat_${state}.png`))

        const totalImages = imagesToLoad.length
        let loadedCount = 0

        await Promise.all(
          imagesToLoad.map(async (src) => {
            try {
              await loadImage(src)
              if (isMountedRef.current) {
                loadedCount++
                setProgress(Math.floor(10 + (loadedCount / totalImages) * 90))
              }
            } catch (error) {
              console.error(`이미지 로드 실패: ${src}`, error)
              throw error
            }
          })
        )

        if (isMountedRef.current) {
          setResourcesLoaded(true)
          setProgress(100)
          completeLoading()
        }
      } catch (error) {
        console.error("리소스 로드 중 오류 발생:", error)
        if (isMountedRef.current) {
          alert("게임 리소스 로드에 실패했습니다. 페이지를 새로고침해주세요.")
          setLoading(false)
        }
      }
    }

    loadResources()

    return () => {
      isMountedRef.current = false
      setLoading(false)
    }
  }, [characterTypes, resourcesLoaded])

  return { resourcesLoaded }
}
