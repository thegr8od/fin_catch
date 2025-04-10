package com.finbattle.domain.game.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EventType {
    MULTIPLE_QUIZ,  //객관식 퀴즈
    SHORT_QUIZ,     //주관식 퀴즈
    ESSAY_QUIZ,     //서술형 퀴즈
    QUIZ_RESULT,    //퀴즈 결과
    FIRST_HINT,     //퀴즈 1번째 힌트
    SECOND_HINT,    //퀴즈 2번째 힌트
    ONE_ATTACK,     //한 명의 라이프 -1
    TWO_ATTACK,     //두 명의 라이프 -1
    REWARD;       //게임 종료

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
