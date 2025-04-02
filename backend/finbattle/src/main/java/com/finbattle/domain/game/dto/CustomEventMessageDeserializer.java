package com.finbattle.domain.game.dto;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomEventMessageDeserializer extends JsonDeserializer<EventMessage<?>> {

    private final ObjectMapper objectMapper;

    @Override
    public EventMessage<?> deserialize(JsonParser jsonParser,
        DeserializationContext deserializationContext)
        throws IOException, JacksonException {
        JsonNode node = jsonParser.readValueAsTree();

        // 필드 추출
        EventType event = EventType.valueOf(node.get("event").asText());
        Long roomId = node.get("roomId").asLong();
        JsonNode dataNode = node.get("data");

        Object data = switch (event) {
            case TWO_ATTACK ->
                // TWO_ATTACK의 data는 List<GameMemberStatus>
                objectMapper.readValue(
                    dataNode.toString(),
                    TypeFactory.defaultInstance()
                        .constructCollectionType(List.class, GameMemberStatus.class)
                );
            case MULTIPLE_QUIZ, SHORT_QUIZ, ESSAY_QUIZ, QUIZ_RESULT, ONE_ATTACK, FIRST_HINT,
                 SECOND_HINT, REWARD ->
                // FIRST_HINT와 SECOND_HINT의 data는 Map<String, Object>
                objectMapper.readValue(
                    dataNode.toString(),
                    TypeFactory.defaultInstance()
                        .constructMapType(Map.class, String.class, Object.class)
                );
            default -> throw new UnsupportedOperationException("Unsupported event type: " + event);
        };

        return new EventMessage<>(event, roomId, data);
    }
}
