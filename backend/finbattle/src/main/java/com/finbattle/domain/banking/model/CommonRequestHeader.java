package com.finbattle.domain.banking.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CommonRequestHeader {

    private String apiName;
    private String transmissionDate;
    private String transmissionTime;
    private String institutionCode;
    private String fintechAppNo;
    private String apiServiceCode;
    private String institutionTransactionUniqueNo;
    private String apiKey;
    private String userKey;

    // 생성자에서 자동으로 값 할당
    public CommonRequestHeader(String apiName, String apiKey, String userKey) {
        this.apiName = apiName;
        this.transmissionDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        this.transmissionTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        this.institutionCode = "00100";
        this.fintechAppNo = "001";
        this.apiServiceCode = apiName;
        this.institutionTransactionUniqueNo = generateUniqueTransactionNo();
        this.apiKey = apiKey;
        this.userKey = userKey;
    }

    // 고유 거래번호 생성
    private String generateUniqueTransactionNo() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
            LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss")) +
            UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    @Override
    public String toString() {
        return "{" +
            "\"apiName\": \"" + apiName + "\"," +
            "\"transmissionDate\": \"" + transmissionDate + "\"," +
            "\"transmissionTime\": \"" + transmissionTime + "\"," +
            "\"institutionCode\": \"" + institutionCode + "\"," +
            "\"fintechAppNo\": \"" + fintechAppNo + "\"," +
            "\"apiServiceCode\": \"" + apiServiceCode + "\"," +
            "\"institutionTransactionUniqueNo\": \"" + institutionTransactionUniqueNo + "\"," +
            "\"apiKey\": \"" + apiKey + "\"," +
            "\"userKey\": \"" + userKey + "\"" +
            "}";
    }
}
