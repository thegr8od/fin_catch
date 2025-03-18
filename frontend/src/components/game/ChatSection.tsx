import { ChatMessage } from "./chatType"
import { useEffect, useRef } from "react"

interface ChatSectionProps {
  chatMessages: ChatMessage[]
  chatInput?: string
  onChatSubmit?: (e: React.FormEvent) => void
  onChatInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  showInput?: boolean
}

const ChatSection = ({ chatMessages, chatInput, onChatSubmit, onChatInputChange, showInput = false }: ChatSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  return (
    <div className="w-full h-full bg-white bg-opacity-80 rounded-lg p-2 flex flex-col">
      <div className="text-sm font-bold mb-2 border-b border-gray-300 pb-1">채팅</div>
      <div className="flex-grow overflow-y-auto mb-2 text-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {chatMessages.map((msg, index) => (
          <div key={index} className="mb-1 break-words">
            <span className="font-bold">{msg.sender}:</span> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showInput && (
        <form onSubmit={onChatSubmit} className="flex">
          <input type="text" value={chatInput} onChange={onChatInputChange} className="flex-grow p-2 rounded-l-lg border-0" placeholder="메시지를 입력하세요..." />
          <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded-r-lg">
            전송
          </button>
        </form>
      )}
    </div>
  )
}

export default ChatSection
