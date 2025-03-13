package com.finbattle.domain.banking.model;

public class ResponseHeader {

    private String responseCode; // 응답코드
    private String responseMessage; // 응답메시지
    private String apiName; // API 이름
    private String transmissionDate; // 전송일자 (YYYYMMDD)
    private String transmissionTime; // 전송시각 (HHMMSS)
    private String institutionCode = "00100"; // 기관코드 ('00100' 고정)
    private String fintechAppNo = "001"; // 핀테크 앱 일련번호 ('001' 고정)
    private String apiServiceCode; // API 서비스코드
    private String institutionTransactionUniqueNo; // 기관거래고유번호
}
