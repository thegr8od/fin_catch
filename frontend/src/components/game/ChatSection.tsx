import React, { useEffect, useRef } from "react"
import { ChatMessage } from "./chatType"

interface ChatSectionProps {
  chatMessages?: ChatMessage[]
  chatInput?: string
  onChatInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onChatSubmit?: (e: React.FormEvent) => void
  showInput?: boolean
  showMessages?: boolean
}

const ChatSection = React.memo(({ chatMessages = [], chatInput = "", onChatInputChange, onChatSubmit, showInput = true, showMessages = true }: ChatSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  return (
    <div className="w-full h-full bg-white bg-opacity-80 rounded-lg p-2 flex flex-col">
      {showMessages && (
        <>
          <div className="text-sm font-bold border-b border-gray-300 pb-1">채팅</div>
          <div className="flex-1 overflow-y-auto my-1 text-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {chatMessages.map((msg, index) => (
              <div key={index} className="mb-1 break-words">
                <span className="font-bold">{msg.sender}:</span> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
      {showInput && onChatSubmit && onChatInputChange && (
        <div className="w-full mt-auto">
          <form onSubmit={onChatSubmit} className="flex h-8">
            <input type="text" value={chatInput} onChange={onChatInputChange} className="flex-1 min-w-0 rounded-l-lg border-0 text-sm py-1 px-2" placeholder="메시지를 입력하세요..." />
            <button type="submit" className="bg-yellow-400 text-black px-3 text-sm rounded-r-lg whitespace-nowrap">
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  )
})

ChatSection.displayName = "ChatSection"

export default ChatSection
