import { ChatMessage } from "./chatType"
import { CharacterState } from "./types/character"
import CharacterAnimation from "./CharacterAnimation"

interface PlayerSectionProps {
  name: string
  health: number
  state: CharacterState
  bubble: ChatMessage | null
  resourcesLoaded: boolean
  direction: boolean
  onAnimationComplete: (state: CharacterState) => void
}

const PlayerSection = ({ name, health, state, bubble, resourcesLoaded, direction, onAnimationComplete }: PlayerSectionProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* 이름과 말풍선을 하나의 그룹으로 묶음 */}
      <div className="absolute bottom-full w-full flex flex-col items-center mb-2">
        {/* 말풍선 */}
        {bubble && (
          <div className="w-full flex justify-center mb-2">
            <div className="bg-white bg-opacity-80 rounded-lg p-4 min-w-[10rem] max-w-[15rem] relative">
              {/* 스크롤이 있는 메시지 컨테이너 */}
              <div className="max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                <div className="text-sm whitespace-normal break-words">{bubble.message}</div>
              </div>
              {/* 말풍선 꼬리 */}
              <div className="absolute w-4 h-4 bg-white bg-opacity-80 rotate-45 bottom-[-8px] left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        )}
        {/* 이름 */}
        <div className="text-center z-10">
          <span className="text-lg font-bold text-white whitespace-nowrap bg-black bg-opacity-50 px-2 py-1 rounded">{name}</span>
        </div>
      </div>
      <div className="flex mb-2">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <span key={index} className="text-2xl mx-1">
              {index < health ? "❤️" : "🖤"}
            </span>
          ))}
      </div>
      <div className="w-full max-w-[300px] aspect-[3/2] flex items-center justify-center mb-3 p-2">
        <CharacterAnimation
          state={state} // health 체크 대신 직접 state 전달
          direction={direction}
          scale={5}
          resourcesLoaded={resourcesLoaded}
          onAnimationComplete={() => onAnimationComplete(state)} // 추가
        />
      </div>
    </div>
  )
}

export default PlayerSection
