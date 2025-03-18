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
    <div className="w-full flex flex-col items-center justify-center">
      <div className="h-20 mb-2">
        {bubble && (
          <div className="w-full flex justify-center">
            <div className="bg-white bg-opacity-80 rounded-lg p-4 min-w-[10rem] max-w-[11rem] relative">
              <div className="text-sm whitespace-normal break-words">{bubble.message}</div>
              <div className="absolute w-4 h-4 bg-white bg-opacity-80 rotate-45 bottom-[-8px] left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        )}
      </div>
      <div className="w-[300px] h-64 flex items-center justify-center mb-3 p-2">
        <CharacterAnimation
          state={state} // health 체크 대신 직접 state 전달
          direction={direction}
          scale={5}
          resourcesLoaded={resourcesLoaded}
          onAnimationComplete={() => onAnimationComplete(state)} // 추가
        />
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
      <div className="text-center">
        <span className="text-lg font-bold text-white whitespace-nowrap">{name}</span>
      </div>
    </div>
  )
}

export default PlayerSection
