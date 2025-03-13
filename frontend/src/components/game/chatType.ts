export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: Date;
    isVisible?: boolean;
  }