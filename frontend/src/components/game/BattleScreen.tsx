import React from "react"
import { PlayerStatus, CharacterState } from "./types/character"
import PlayerSection from "./PlayerSection"
import BattleStatus from "./BattleStatus"
import ChatSection from "./ChatSection"
import { useChat } from "../../hooks/useChat"

interface BattleScreenProps {
  resourcesLoaded: boolean
  playerStatus: PlayerStatus
  opponentStatus: PlayerStatus
  timer: number
  questionText: string
  onPlayerAnimationComplete: (state: CharacterState) => void
  onOpponentAnimationComplete: (state: CharacterState) => void
  onAttack: (playerId: number) => void
}

const BattleScreen = React.memo(({ resourcesLoaded, playerStatus, opponentStatus, timer, questionText, onPlayerAnimationComplete, onOpponentAnimationComplete, onAttack }: BattleScreenProps) => {
  const { chatInput, chatMessages, playerBubble, handleChatInputChange, handleChatSubmit } = useChat({
    playerName: playerStatus.name,
  })

  const playerShouldLoop = playerStatus.state === "idle" || playerStatus.state === "victory";
  const opponentShouldLoop = opponentStatus.state === "idle" || opponentStatus.state === "victory";

  if (!resourcesLoaded) {
    return <div className="h-full w-full"></div>
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 상단 VS 및 문제 영역 */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="w-3/4 max-w-3xl mx-auto">
          <BattleStatus timer={timer} question={questionText} />
        </div>
      </div>

      {/* 중앙 플레이어 영역 */}
      <div className="flex-1 w-full flex justify-between items-center px-8 pt-20">
        {/* 왼쪽 플레이어 */}
        <div className="w-1/3">
          <PlayerSection
            characterType={playerStatus.characterType}
            characterState={playerStatus.state}
            name={playerStatus.name}
            health={playerStatus.health}
            maxHealth={5}
            bubble={playerBubble}
            direction={true}
            onAnimationComplete={onPlayerAnimationComplete}
            shouldLoop={playerShouldLoop}
          />
        </div>
        <div>
          <button onClick={() => onAttack(playerStatus.id)}>공격</button>
        </div>

        {/* 오른쪽 플레이어 */}
        <div className="w-1/3">
          <PlayerSection
            characterType={opponentStatus.characterType}
            characterState={opponentStatus.state}
            name={opponentStatus.name}
            health={opponentStatus.health}
            maxHealth={5}
            bubble={null}
            direction={false}
            onAnimationComplete={onOpponentAnimationComplete}
            shouldLoop={opponentShouldLoop}
          />
        </div>
        <div>
          <button onClick={() => onAttack(opponentStatus.id)}>공격</button>
        </div>

      </div>

      {/* 채팅 영역 - 중앙 하단에 배치 */}
      <div className="w-1/3 h-[12rem] mx-auto mb-12">
        <div className="w-full h-full">
          <ChatSection chatMessages={chatMessages} chatInput={chatInput} onChatInputChange={handleChatInputChange} onChatSubmit={handleChatSubmit} showInput={true} showMessages={true} />
        </div>
      </div>
    </div>
  )
})

BattleScreen.displayName = "BattleScreen"

export default BattleScreen
