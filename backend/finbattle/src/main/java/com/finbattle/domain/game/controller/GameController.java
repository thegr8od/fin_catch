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

    @MessageMapping("/game/{roomId}/start/{userId}")
    public void startGame(@DestinationVariable String roomId, @DestinationVariable Long userId) {
        log.info("Received game start request for roomId: {} by user: {}", roomId, userId);
        gameService.startGame(roomId, userId);
    }
}
