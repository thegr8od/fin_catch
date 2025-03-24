package com.finbattle.domain.banking.dto.financemember;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FinanceMemberRequestDto {

    private final String apiKey;

    private final String userId;

}
