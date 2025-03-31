package com.finbattle.domain.banking.model;

import com.finbattle.domain.banking.dto.transaction.TransactionRecordDto;
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
public class TransactionList {

    private String totalCount;
    private List<TransactionRecordDto> list;
}
