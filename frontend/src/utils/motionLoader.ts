// frontend/src/utils/motionLoader.ts

// 이미지 캐시
const imageCache: Record<string, string[]> = {}

// 모든 모션에 적용할 기본 애니메이션 속도
export const DEFAULT_ANIMATION_SPEED = 0.2

/**
 * 이미지 경로가 유효한지 확인하는 함수
 * @param path 이미지 경로
 * @returns 이미지 존재 여부
 */
export const checkImageExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error(`이미지 경로 확인 실패: ${path}`, error)
    return false
  }
}

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
      // 경로 형식 수정 - 슬래시 추가 확인
      const imagePath = `/game/${motionName}/${motionName}${i}.png`

      // 디버깅을 위한 로그
      console.log(`생성된 이미지 경로: ${imagePath}`)

      images.push(imagePath)
    }

    // 캐시에 저장
    imageCache[cacheKey] = images

    return images
  } catch (error) {
    console.error(`Failed to load images for motion: ${motionName}`, error)
    // 오류 발생 시 빈 배열 대신 대체 이미지 경로 반환
    const fallbackImages = Array(frameCount).fill("/game/fallback.png")
    return fallbackImages
  }
}
