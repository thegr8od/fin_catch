import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./chatType";

interface ChatSectionProps {
  chatMessages?: ChatMessage[];
  chatInput?: string;
  onChatInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setChatInput?: React.Dispatch<React.SetStateAction<string>>;
  onChatSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  showInput?: boolean;
  showMessages?: boolean;
}

const ChatSection = React.memo(({ chatMessages = [], chatInput = "", onChatInputChange, setChatInput, onChatSubmit, handleSubmit, showInput = true, showMessages = true }: ChatSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div className="w-full h-[12rem] bg-white bg-opacity-80 rounded-lg p-2 flex flex-col shadow-md" id="chatbox-container">
      {showMessages && (
        <>
          <div className="text-sm font-bold border-b border-gray-300 pb-1" id="chatbox-header">
            채팅
          </div>
          <div className="flex-1 overflow-y-auto my-1 text-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" id="chatbox-messages">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 my-2">채팅 메시지가 없습니다</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={`chat-msg-${index}-${msg.timestamp.getTime()}`} className="mb-1 break-words">
                  <span className="font-bold">{msg.sender}:</span> {msg.message}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
      {showInput && (handleSubmit || onChatSubmit) && (
        <div className="w-full mt-auto" id="chatbox-input">
          <form onSubmit={handleSubmit || onChatSubmit} className="flex h-8">
            <input
              type="text"
              value={chatInput}
              onChange={onChatInputChange || ((e) => setChatInput && setChatInput(e.target.value))}
              className="flex-1 min-w-0 rounded-l-lg border-0 text-sm py-1 px-2"
              placeholder="메시지를 입력하세요..."
            />
            <button type="submit" className="bg-yellow-400 text-black px-3 text-sm rounded-r-lg whitespace-nowrap">
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
});

ChatSection.displayName = "ChatSection";

export default ChatSection;
