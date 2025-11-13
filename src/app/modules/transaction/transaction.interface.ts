// transaction.interface.ts (update)
import { Types } from "mongoose";

export enum TransactionInitiatedBy {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export enum TransactionType {
  SEND_MONEY = "SEND_MONEY",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  ADD_MONEY = "ADD_MONEY",
  WITHDRAW = "WITHDRAW",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  from: Types.ObjectId;
  to:Types.ObjectId;
  amount: number;
  type: TransactionType;
  initiatedBy: TransactionInitiatedBy;
  fromWallet?: Types.ObjectId; 
  toWallet?: Types.ObjectId;   
  pin?: string;
  status?: TransactionStatus;
  commission?: {
    agentCommission?: number;
    superAdminCommission?: number;
    systemFee?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}