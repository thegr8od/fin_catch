package com.finbattle.domain.banking.dto.account;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindAllAccountResponseDto {

    private Long mainAccount;
    private List<AccountResponseDto> accounts;
}
