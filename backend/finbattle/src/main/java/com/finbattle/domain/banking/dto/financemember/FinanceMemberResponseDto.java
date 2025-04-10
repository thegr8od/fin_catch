package com.finbattle.domain.banking.dto.financemember;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@ToString
public class FinanceMemberResponseDto {

    private final String userId;

    private final String userName;

    private final String institutionCode;

    private final String userKey;

    private final String created;

    private final String modified;

}
