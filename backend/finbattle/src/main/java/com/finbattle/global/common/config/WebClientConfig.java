package com.finbattle.global.common.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    private final String apiUrl;

    public WebClientConfig(@Value("${app.financeApi}") String apiUrl) {
        this.apiUrl = apiUrl;
    }

    @Bean
    @Qualifier("fastApiWebClient")
    public WebClient fastApiWebClient() {
        return WebClient.builder()
            .baseUrl("http://localhost:8000") // FastAPI 주소
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }


    @Bean
    @Qualifier("financeWebClient")
    public WebClient financeWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl(apiUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}
