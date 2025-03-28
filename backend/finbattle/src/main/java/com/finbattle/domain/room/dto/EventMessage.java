package com.finbattle.domain.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventMessage<T> {

    private MessageType event;
    private Long roomId;
    private T data;
}
