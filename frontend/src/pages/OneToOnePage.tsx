import React from "react"
import { useParams } from "react-router-dom"
import battleBackground from "../assets/battlebg.png"
import BattleScreen from "../components/game/BattleScreen"
import { useGameResources } from "../hooks/useGameResources"
import { useGameState } from "../hooks/useGameState"
import { usePreventNavigation } from "../hooks/usePreventNavigation"
import { useChat } from "../hooks/useChat"
import GameLayout from "../components/layout/GameLayout"

const OneToOnePage: React.FC = () => {
  const roomIdParam = useParams<{ roomId: string }>().roomId
  const roomId = roomIdParam || ""

  const { gameState, playerStatus, opponentStatus, handleAnimationComplete } = useGameState(roomId)
  const { resourcesLoaded } = useGameResources([playerStatus.characterType, opponentStatus.characterType])
  const { chatInput, chatMessages, playerBubble, handleChatInputChange, handleChatSubmit } = useChat({ playerName: playerStatus.name })

  usePreventNavigation({
    roomId: gameState.roomId || null,
    gameType: "1vs1",
  })

  return (
    <GameLayout background={battleBackground}>
      <div className="w-full h-full">
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
    </GameLayout>
  )
}

export default OneToOnePage
