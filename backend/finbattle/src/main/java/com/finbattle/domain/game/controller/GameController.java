package com.finbattle.domain.game.controller;

import com.finbattle.domain.game.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @MessageMapping("/game/{roomId}-getInfo")
    public void getGameInfo(@DestinationVariable String roomId) {
        log.info("Received game info request for roomId: {}", roomId);
        gameService.publishGameInfo(roomId);
    }

    @MessageMapping("/game/{roomId}-hint")
    public void requestGameHint(@DestinationVariable String roomId) {
        log.info("Received game hint request for roomId: {}", roomId);
        gameService.publishGameHint(roomId);
    }

    @MessageMapping("/game/{roomId}-connect")
    public void userConnect(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        String userId = payload.get("userId");
        log.info("User connected: {} to roomId: {}", userId, roomId);
        gameService.userConnected(roomId, userId);
    }
}
