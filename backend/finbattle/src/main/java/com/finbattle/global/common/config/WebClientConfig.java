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

    private final String financeapiUrl;
    private final String fastapiUrl;

    public WebClientConfig(@Value("${app.financeApi}") String financeapiUrl,
        @Value("${app.fastapiUrl}") String fastapiUrl) {
        this.financeapiUrl = financeapiUrl;
        this.fastapiUrl = fastapiUrl;
    }

    @Bean
    @Qualifier("fastApiWebClient")
    public WebClient fastApiWebClient() {
        return WebClient.builder()
            .baseUrl(fastapiUrl) // FastAPI 주소
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }


    @Bean
    @Qualifier("financeWebClient")
    public WebClient financeWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl(financeapiUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}
