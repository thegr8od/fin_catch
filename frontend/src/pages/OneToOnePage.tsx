import React from "react"
import { useParams } from "react-router-dom"
import battleBackground from "../assets/battlebg.png"
import BattleScreen from "../components/game/BattleScreen"
import Background from "../components/layout/Background"
import { useGameResources } from "../hooks/useGameResources"
import { useGameState } from "../hooks/useGameState"
import { usePreventNavigation } from "../hooks/usePreventNavigation"
import { useChat } from "../hooks/useChat"

const OneToOnePage: React.FC = () => {
  const roomIdParam = useParams<{ roomId: string }>().roomId
  const roomId = roomIdParam || ""

  const { gameState, playerStatus, opponentStatus, handleAnimationComplete } = useGameState(roomId)

  const { resourcesLoaded } = useGameResources([playerStatus.characterType, opponentStatus.characterType])

  const { chatInput, chatMessages, playerBubble, handleChatInputChange, handleChatSubmit } = useChat({ playerName : playerStatus.name })

  usePreventNavigation({
    roomId: gameState.roomId || null,
    gameType: "1vs1",
  })

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 배경 이미지 레이어 */}
      <Background backgroundImage={battleBackground}>
        {/* 게임 컨텐츠 레이어 */}

        <div className="relative z-10 w-full h-full flex flex-col">
          {/* 상단 네비게이션 영역 */}

          {/* 메인 게임 영역 - 수직/수평 중앙 정렬 */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full py-8">
              <BattleScreen
                resourcesLoaded={resourcesLoaded}
                playerStatus={playerStatus}
                opponentStatus={opponentStatus}
                playerBubble={playerBubble}
                timer={gameState.remainingTime}
                questionText={gameState.currentQuestion}
                chatMessages={chatMessages}
                chatInput={chatInput}
                onChatSubmit={handleChatSubmit}
                onChatInputChange={handleChatInputChange}
                onPlayerAnimationComplete={(state) => handleAnimationComplete(playerStatus.id, state)}
                onOpponentAnimationComplete={(state) => handleAnimationComplete(opponentStatus.id, state)}
              />
            </div>
          </div>
        </div>
      </Background>
    </div>
  )
}

export default OneToOnePage
