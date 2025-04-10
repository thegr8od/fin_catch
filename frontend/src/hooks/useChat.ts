import { useState } from "react";

// 간소화된 버전의 useChat 훅
// 이제 메시지 상태 관리는 GameContext에서 처리
export const useChat = () => {
  const [chatInput, setChatInput] = useState<string>("");

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatInput("");
  };

  return {
    chatInput,
    chatMessages: [], // 빈 배열 반환 (GameContext에서 채팅 메시지를 관리)
    playerBubble: null, // 항상 null 반환
    handleChatInputChange,
    handleChatSubmit,
  };
};
