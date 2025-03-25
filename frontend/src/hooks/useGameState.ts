import { useState } from "react"
import { CharacterState, PlayerStatus } from "../components/game/types/character"

interface GameState {
  roomId: string | null
  currentQuestion: string
  remainingTime: number
  gameStatus: "waiting" | "playing" | "finished"
  correctAnswer?: string //정답
  lastAnsweredId?: number //마지막으로 정답을 맞춘 사람
}

export const useGameState = (roomId: string) => {
  const [gameState, setGameState] = useState<GameState>({
    roomId: roomId || null,
    currentQuestion: "",
    remainingTime: 20,
    gameStatus: "playing",
  })

  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    id: 1,
    name: localStorage.getItem("host") || "방장",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  })

  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>({
    id: 1,
    name: "참가자",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  })

  const handleAnimationComplete = (playerId: number, currentState: CharacterState) => {
    if (currentState === "attack" || currentState === "damage") {
      if (playerId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }))
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }))
      }
    }
  }

  return {
    gameState,
    setGameState,
    playerStatus,
    setPlayerStatus,
    opponentStatus,
    setOpponentStatus,
    handleAnimationComplete,
  }
}
