import { Response } from "../response/Response";

export interface Account {
  accountNumber: number;
  bankCode: string;
  productName: string;
  accountBalance: number;
  isDefault: boolean;
}

export interface AllAccount {
  accountList: Account[];
  totalBalance: number;
}

export interface AccountDetail {
  consumeHistory: ConsumeHistory[];
  ownerName: string;
  dailyLimit: number;
  oneTimeLimit: number;
  accountOpenDate: string;
  accountCloseDate: string;
}

export interface ConsumeHistory {
  consumeDate: string;
  consumeAmount: number;
  consumeType: string;
  consumePlace: string;
}
