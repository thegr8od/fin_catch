import { ChatMessage } from "./chatType"
import PlayerSection from "./PlayerSection"
import BattleStatus from "./BattleStatus"
import ChatSection from "./ChatSection"
// import EffectAnimation from "./EffectAnimation"
// import { getMotionImages } from "../../utils/motionLoader"
import { PlayerStatus, CharacterState } from "./types/character"

interface BattleScreenProps {
  resourcesLoaded: boolean
  playerStatus: PlayerStatus
  opponentStatus: PlayerStatus
  playerBubble: ChatMessage | null
  timer: number
  questionText: string
  chatMessages: ChatMessage[]
  chatInput: string
  onChatSubmit: (e: React.FormEvent) => void
  onChatInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPlayerAnimationComplete: (state: CharacterState) => void
  onOpponentAnimationComplete: (state: CharacterState) => void
}

const BattleScreen: React.FC<BattleScreenProps> = ({
  resourcesLoaded,
  playerStatus,
  opponentStatus,
  playerBubble,
  timer,
  questionText,
  chatMessages,
  chatInput,
  onChatSubmit,
  onChatInputChange,
  onPlayerAnimationComplete,
  onOpponentAnimationComplete,
}) => {
  if (!resourcesLoaded) {
    return <div className="h-full w-full"></div>
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* 상단 VS 및 문제 영역 - absolute 포지션 */}
      <div className="absolute top-8 left-0 right-0 z-10">
        <div className="w-3/4 max-w-3xl mx-auto">
          <BattleStatus timer={timer} question={questionText} />
        </div>
      </div>

      {/* 중앙 플레이어 영역 - 위치 조정 */}
      <div className="w-full flex justify-between items-center px-8 h-full pt-15">
        {/* 왼쪽 플레이어 */}
        <div className="w-1/4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-center relative">
            <PlayerSection
              name={playerStatus.name}
              health={playerStatus.health}
              state={playerStatus.state}
              bubble={playerBubble}
              resourcesLoaded={resourcesLoaded}
              direction={true}
              onAnimationComplete={onPlayerAnimationComplete}
            />
          </div>
        </div>

        {/* 중앙 이펙트 영역 */}
        {/* <div className="w-1/2 relative">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] h-[300px]">
            <PlayerSection
              name={opponentStatus.name}
              health={opponentStatus.health}
              state={opponentStatus.state}
              bubble={null}
              resourcesLoaded={resourcesLoaded}
              direction={false}
              onAnimationComplete={onOpponentAnimationComplete}
            />
          </div>
        </div> */}

        {/* 오른쪽 플레이어 */}
        <div className="w-1/4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-center relative">
            <PlayerSection
              name={opponentStatus.name}
              health={opponentStatus.health}
              state={opponentStatus.state}
              bubble={null}
              resourcesLoaded={resourcesLoaded}
              direction={false}
              onAnimationComplete={onOpponentAnimationComplete}
            />
          </div>
        </div>
      </div>

      {/* 하단 채팅 영역 - 좌하단에 배치, 고정 크기 */}
      <div className="absolute bottom-16 left-4 w-1/4 h-[6rem] z-20">
        <ChatSection chatMessages={chatMessages} showInput={false} />
      </div>

      {/* 채팅 입력창 - 화면 중앙 하단에 배치 */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-1/3 z-20">
        <form onSubmit={onChatSubmit} className="flex">
          <input type="text" value={chatInput} onChange={onChatInputChange} className="flex-grow p-2 rounded-l-lg border-0" placeholder="메시지를 입력하세요..." />
          <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded-r-lg">
            전송
          </button>
        </form>
      </div>
    </div>
  )
}

export default BattleScreen
