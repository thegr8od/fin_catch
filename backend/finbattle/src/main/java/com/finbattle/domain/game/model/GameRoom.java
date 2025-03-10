package com.finbattle.domain.game.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "game_room")
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId; // 예: 실제 room PK가 아니라 별도 식별자
    private String status; // READY, PLAYING, FINISHED
    private int score;

    public GameRoom(String roomId, String status, int score) {
        this.roomId = roomId;
        this.status = status;
        this.score = score;
    }
}
