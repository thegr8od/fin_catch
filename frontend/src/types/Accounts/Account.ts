export interface Account {
  accountNo: string;
  bankCode: string;
  accountName: string;
  accountBalance: number;
}

export interface AllAccount {
  mainAccount: string;
  accounts: Account[];
}

export interface AccountDetail {
  bankCode: string;
  bankName: string;
  userName: string;
  accountNo: string;
  accountName: string;
  accountTypeCode: string;
  accountTypeName: string;
  accountCreateDate: string;
  accountExpiryDate: string;
  dailyTransferLimit: number;
  oneTimeTransferLimit: number;
  accountBalance: number;
  lastTranscationDate: string;
  currency: string;
}

export interface ConsumeHistory {
  transcationUniqueNo: string;
  transcationDate: string;
  transcationTime: string;
  transcationType: string;
  transcationTypeName: string;
  transcationBalance: number;
  transcationAfterBalance: number;
  transcationSummary: string;
  transcationMemo: string;
}

export interface AllConsumeHistory {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    Header: {
      responseCode: string;
      responseMessage: string;
      apiName: string;
      transmissionDate: string;
      transmissionTime: string;
      institutionCode: string;
      apiKey: string;
      apiServiceCode: string;
      institutionTransactionUniqueNo: string;
    };
    REC: {
      totalCount: string;
      list: ConsumeHistory[];
    };
  };
}
