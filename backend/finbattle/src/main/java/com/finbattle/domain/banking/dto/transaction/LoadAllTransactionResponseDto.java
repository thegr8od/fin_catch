package com.finbattle.domain.banking.dto.transaction;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finbattle.domain.banking.model.CommonResponseHeader;
import com.finbattle.domain.banking.model.TransactionList;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class LoadAllTransactionResponseDto {

    @JsonProperty("Header")
    private CommonResponseHeader header;

    @JsonProperty("REC")
    private TransactionList REC;
}
