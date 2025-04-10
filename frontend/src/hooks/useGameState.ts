import { useState } from "react"
import { CharacterState, PlayerStatus } from "../components/game/types/character"
import { useUserInfo } from "./useUserInfo"
import { CharacterType } from "../components/game/constants/animations"
import { GameState } from "../components/game/types/game"

export const useGameState = (roomId: string) => {
  const { user } = useUserInfo()

  const userCat = (user?.mainCat || "classic") as CharacterType

  const [gameState, setGameState] = useState<GameState>({
    roomId: roomId || null,
    currentQuestion: "",
    remainingTime: 20,
    gameStatus: "playing",
  })

  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    id: 1,
    name: localStorage.getItem("host") || "방장",
    characterType: userCat,
    health: 5,
    state: "idle",
    score: 0,
  })

  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>({
    id: 2,
    name: "참가자",
    characterType: userCat,
    health: 5,
    state: "idle",
    score: 0,
  })

  const handleAttack = (playerId: number) => {
    if (playerId === playerStatus.id) {
      setPlayerStatus((prev) => ({
        ...prev,
        state: "attack"
      }))
      setOpponentStatus((prev) => ({
        ...prev,
        state: "damage",
        health: prev.health - 1
      }))
    } else {
      setOpponentStatus((prev) => ({
        ...prev,
        state: "attack"
      }))
      setPlayerStatus((prev) => ({
        ...prev,
        state: "damage",
        health: prev.health - 1
      }))
    }
  }

  const handleAnimationComplete = (playerId: number, currentState: CharacterState) => {
    if (currentState === "attack" || currentState === "damage") {
      if (playerId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }))
        if (playerStatus.health < 1) {
          setOpponentStatus((prev) => ({
            ...prev,
            state: "victory",
          }))
        }
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }))
        if (opponentStatus.health < 1) {
          setPlayerStatus((prev) => ({
            ...prev,
            state: "victory",
          }))
        }
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
    handleAttack,
    handleAnimationComplete,
  }
}
