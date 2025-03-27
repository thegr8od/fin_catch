export interface GameState {
    roomId: string | null;
    currentQuestion: string;
    remainingTime: number;
    gameStatus: "waiting" | "playing" | "finished"
    correctAnswer?: string
    lastAnsweredId?: number //마지막으로 정답을 맞춘 사람
}