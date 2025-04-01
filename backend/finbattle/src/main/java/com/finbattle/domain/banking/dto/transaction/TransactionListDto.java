package com.finbattle.domain.banking.dto.transaction;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionListDto {

    private String totalCount;
    private List<TransactionRecordDto> list;
}
