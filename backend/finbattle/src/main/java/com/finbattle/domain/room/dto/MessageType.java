package com.finbattle.domain.room.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MessageType {
    CREATE,
    READY,
    COUNT,
    JOIN_FAIL,
    NOT_READY,
    DELETE,
    LEAVE,
    KICK_FAIL,
    KICK,
    INFO;

    @JsonValue
    @Override
    public String toString() {
        return name();  // ✅ `name()`을 반환하여 대문자로 변환
    }

    @JsonCreator
    public static MessageType fromValue(String value) {
        for (MessageType type : values()) {
            if (type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown MessageType: " + value);
    }
}
