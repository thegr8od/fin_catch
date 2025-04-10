package com.finbattle.domain.banking.service;

import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class FinanceApiClient {

    private final WebClient financeWebClient;

    public <T> T post(String uri, Object body, Class<T> responseType) {
        return financeWebClient.post()
            .uri(uri)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(responseType);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: {}", errorBody);
                        return Mono.error(new RuntimeException("Finance API 호출 실패: " + errorBody));
                    });
                }
            })
            .block();
    }

    public <T, E extends RuntimeException> T post(String uri, Object body, Class<T> responseType,
        Supplier<E> exceptionSupplier) {
        return financeWebClient.post()
            .uri(uri)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(responseType);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: {}", errorBody);
                        return Mono.error(exceptionSupplier.get());
                    });
                }
            })
            .block();
    }
}
