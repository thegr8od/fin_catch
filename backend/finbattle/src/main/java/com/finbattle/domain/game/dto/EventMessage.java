package com.finbattle.domain.game.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(using = CustomEventMessageDeserializer.class)
public class EventMessage<T> {

    private EventType event;
    private Long roomId;
    private T data;
}
