package com.finbattle.domain.banking.dto.account;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finbattle.domain.banking.model.CommonResponseHeader;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FindAccountsApiResponseDto {

    @JsonProperty("Header")
    private CommonResponseHeader Header;

    @JsonProperty("REC")
    private List<AccountApiResponseDto> REC;
}
