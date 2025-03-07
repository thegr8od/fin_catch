// frontend/src/utils/motionLoader.ts

// 이미지 캐시
const imageCache: Record<string, string[]> = {}

// 모든 모션에 적용할 기본 애니메이션 속도
export const DEFAULT_ANIMATION_SPEED = 0.2

/**
 * 모션 이미지 경로 배열을 생성하는 함수
 * @param motionName 모션 이름 (예: "fire", "wind")
 * @param frameCount 프레임 수
 * @returns 이미지 경로 배열
 */
export const getMotionImages = (motionName: string, frameCount: number): string[] => {
  // 이미 캐시에 있으면 캐시에서 반환
  const cacheKey = `${motionName}_${frameCount}`
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey]
  }

  try {
    // 이미지 경로 배열 생성
    const images: string[] = []
    for (let i = 1; i <= frameCount; i++) {
      // public 폴더 내의 이미지를 참조하는 경로

      const imagePath = `/game/${motionName}/${motionName}${i}.png`
      images.push(imagePath)
    }

    // 캐시에 저장
    imageCache[cacheKey] = images

    return images
  } catch (error) {
    console.error(`Failed to load images for motion: ${motionName}`, error)
    return []
  }
}
