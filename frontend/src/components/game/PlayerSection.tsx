import React, { useEffect, useState } from "react"
import { ChatMessage } from "./chatType"
import { CharacterState } from "./types/character"
import CharacterAnimation from "./CharacterAnimation"
import { CharacterType } from "./constants/animations"

interface PlayerSectionProps {
  characterType: CharacterType
  characterState: CharacterState
  direction?: boolean
  name: string
  health: number
  maxHealth: number
  size?: "small" | "large"
  bubble?: ChatMessage | null
  onAnimationComplete: (state: CharacterState) => void
}

const PlayerSection = React.memo(({ characterType, characterState, direction, name, health, maxHealth, size = "large", bubble, onAnimationComplete }: PlayerSectionProps) => {
  // size에 따른 컨테이너 크기 계산
  const containerWidth = size === "small" ? 150 : 200
  const containerHeight = size === "small" ? 100 : 150 // 높이만 50px 감소

  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    if (bubble) {
      setShowBubble(true)
      const timer = setTimeout(() => {
        setShowBubble(false)
      }, 5000) // 5초 후에 버블 숨기기

      return () => clearTimeout(timer)
    } else {
      setShowBubble(false)
    }
  }, [bubble])

  return (
    <div className="relative flex flex-col items-center gap-1">
      {/* 말풍선 */}
      {bubble && showBubble && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white bg-opacity-80 rounded-lg p-3 min-w-[8rem] max-w-[12rem] relative">
            {/* 스크롤이 있는 메시지 컨테이너 */}
            <div className="max-h-[60px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <div className="text-sm whitespace-normal break-words">{bubble.message}</div>
            </div>
            {/* 말풍선 꼬리 */}
            <div className="absolute w-3 h-3 bg-white bg-opacity-80 rotate-45 bottom-[-6px] left-1/2 transform -translate-x-1/2"></div>
          </div>
        </div>
      )}

      {/* 이름 */}
      <div className="text-white text-lg font-bold">{name}</div>

      {/* 체력바 */}
      <div className="flex justify-center">
        {Array(maxHealth)
          .fill(0)
          .map((_, index) => (
            <span key={index} className="text-xl mx-0.5">
              {index < health ? "❤️" : "🖤"}
            </span>
          ))}
      </div>

      {/* 캐릭터 컨테이너 */}
      <div className="relative" style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <CharacterAnimation characterType={characterType} state={characterState} direction={direction} size={size} onAnimationComplete={() => onAnimationComplete(characterState)} />
        </div>
      </div>
    </div>
  )
})

PlayerSection.displayName = "PlayerSection"

export default PlayerSection
