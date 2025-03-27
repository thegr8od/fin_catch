package com.finbattle.domain.banking.dto.account;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finbattle.domain.banking.model.CommonResponseHeader;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class FindByNoResponseDto {

    @JsonProperty("Header")
    private CommonResponseHeader Header;

    @JsonProperty("REC")
    private AccountDetailDto REC;
}
