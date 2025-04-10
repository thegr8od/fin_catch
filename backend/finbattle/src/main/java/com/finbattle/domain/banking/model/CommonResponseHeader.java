package com.finbattle.domain.banking.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class CommonResponseHeader {

    private String responseCode;
    private String responseMessage;
    private String apiName;
    private String transmissionDate;
    private String transmissionTime;
    private String institutionCode;
    private String apiKey;
    private String apiServiceCode;
    private String institutionTransactionUniqueNo;

    @Override
    public String toString() {
        return "{" +
            "\"responseCode\": \"" + responseCode + "\"," +
            "\"responseMessage\": \"" + responseMessage + "\"," +
            "\"apiName\": \"" + apiName + "\"," +
            "\"transmissionDate\": \"" + transmissionDate + "\"," +
            "\"transmissionTime\": \"" + transmissionTime + "\"," +
            "\"institutionCode\": \"" + institutionCode + "\"," +
            "\"apiKey\": \"" + apiKey + "\"," +
            "\"apiServiceCode\": \"" + apiServiceCode + "\"," +
            "\"institutionTransactionUniqueNo\": \"" + institutionTransactionUniqueNo + "\"" +
            "}";
    }
}
