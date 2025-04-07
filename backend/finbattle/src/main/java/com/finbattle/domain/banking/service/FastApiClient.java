package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.analysis.FastApiResponseDto;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class FastApiClient {

    private final WebClient fastApiWebClient;

    public List<FastApiResponseDto> predict(Set<String> summaries) {
        if (summaries.isEmpty()) {
            return Collections.emptyList();
        }

        // 예시: { "summaries": ["스타벅스", "배달의민족"] }
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("store_names", summaries);

        return fastApiWebClient.post()
            .uri("/predict")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<FastApiResponseDto>>() {
            })
            .block(); // block은 동기 처리. 필요 시 비동기로 변경 가능
    }
}

