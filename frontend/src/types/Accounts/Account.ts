import { Response } from "../response/Response";

export interface Account {
  accountNo: number;
  bankCode: string;
  accountName: string;
  accountBalance: number;
}

export interface AllAccount {
  accountList: Account[];
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
