package com.finbattle.domain.game.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EventType {
    USER_STATUS,
    QUIZ,
    QUIZ_RESULT,
    QUIZ_HINT,
    GAME_INFO,
    GAME_START;  // 추가된 상수

    @JsonValue
    @Override
    public String toString() {
        return name();
    }

    @JsonCreator
    public static EventType fromValue(String value) {
        for (EventType type : values()) {
            if (type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown event type: " + value);
    }
}
