package com.finbattle.domain.banking.model;

public class RequestHeader {

    private String apiName; // 호출 API URI의 마지막 Path

    private String transmissionDate; // API 전송일자 (YYYYMMDD) 요청일

    private String transmissionTime; // API 전송시각 (HHMMSS), 요청시간 기준 ±5분

    private String institutionCode = "00100"; // '00100’로 고정

    private String fintechAppNo = "001"; // '001’로 고정

    private String apiServiceCode; // API 이름 필드와 동일

    private String institutionTransactionUniqueNo; // 기관별 API 서비스 호출 단위의 고유 코드

    private String apiKey; // 앱 관리자 (개발자)가 발급받은 API KEY

    private String userKey; // 앱 사용자가 회원가입할 때 발급받은 USER KEY
}
