package com.finbattle.domain.game.controller;

import com.finbattle.domain.game.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * 클라이언트 → 서버: /app/game/{roomId}-getInfo
     * 게임 정보를 조회 후 Redis에 발행 (RedisSubscriber가 WebSocket으로 전송)
     */
    @MessageMapping("/game/{roomId}-getInfo")
    public void getGameInfo(@DestinationVariable String roomId) {
        log.info("Received game info request for roomId: {}", roomId);
        gameService.publishGameInfo(roomId);
    }

    /**
     * 클라이언트 → 서버: /app/game/{roomId}-hint
     * 힌트 요청 시 Redis에 발행 (RedisSubscriber가 WebSocket으로 전송)
     */
    @MessageMapping("/game/{roomId}-hint")
    public void requestGameHint(@DestinationVariable String roomId) {
        log.info("Received game hint request for roomId: {}", roomId);
        gameService.publishGameHint(roomId);
    }

    // 필요하다면 추가로:
    // /game/{roomId}-score, /game/{roomId}-life, /game/{roomId}-question 등
}
