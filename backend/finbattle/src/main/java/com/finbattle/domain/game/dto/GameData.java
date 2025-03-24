package com.finbattle.domain.game.dto;

import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Data
@RedisHash("game")
public class GameData {

    @Id
    Long roomId;

    List<MemberStatus> memberStatusList;
}
