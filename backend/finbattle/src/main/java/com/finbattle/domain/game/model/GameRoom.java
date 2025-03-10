package com.finbattle.domain.game.model;

import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "game_room")
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId; // 게임 방 식별자
    private String status; // 예: READY, PLAYING, FINISHED 등
    private int score;

    public GameRoom(String roomId, String status, int score) {
        this.roomId = roomId;
        this.status = status;
        this.score = score;
    }
}
