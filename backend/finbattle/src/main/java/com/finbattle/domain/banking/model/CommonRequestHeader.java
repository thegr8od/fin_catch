package com.finbattle.domain.banking.model;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
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
        SecureRandom secureRandom = new SecureRandom();
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String randomNum = String.format("%06d", secureRandom.nextInt(1_000_000));
        return date + time + randomNum;
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
