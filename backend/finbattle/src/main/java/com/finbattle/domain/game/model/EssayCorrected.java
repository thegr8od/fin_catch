package com.finbattle.domain.game.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EssayCorrected {

    Long memberId;
    Integer score;
    LocalDateTime createdAt;
}
