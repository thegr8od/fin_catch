import { useState } from "react"

interface ChatMessage {
  sender: string
  message: string
  timestamp: Date
  isVisible?: boolean
}

interface UseChatProps {
  playerName: string
}

export const useChat = ({ playerName }: UseChatProps) => {
  const [chatInput, setChatInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [playerBubble, setPlayerBubble] = useState<ChatMessage | null>(null)

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim() === "") return

    const newMessage: ChatMessage = {
      sender: playerName,
      message: chatInput,
      timestamp: new Date(),
    }

    setChatMessages([...chatMessages, newMessage])
    setPlayerBubble(newMessage)
    setChatInput("")
  }

  return {
    chatInput,
    chatMessages,
    playerBubble,
    handleChatInputChange,
    handleChatSubmit,
  }
}
